import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { generateOTP } from '../helpers/token.helper';

@Injectable()
export class AuthService {
  private readonly resend: Resend;
  private readonly resendFromEmail: string;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.resendFromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
  }

  // ── Register ──────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        displayName: dto.displayName,
        phoneNumber: dto.phoneNumber,
      },
    });

    await this.issueEmailVerificationOtp(user.id, user.email);

    return {
      message:
        'Registration successful. Please verify your email with the OTP sent to continue',
      user: this.exclude(user, ['password']),
    };
  }

  // ── Login ─────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.deletedAt)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerified)
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.exclude(user, ['password']), ...tokens };
  }

  // ── Verify Email ───────────────────────────
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (
      !user ||
      !user.emailVerificationOtpHash ||
      !user.emailVerificationOtpExpiresAt
    )
      throw new BadRequestException('Invalid or expired OTP');

    if (user.emailVerificationOtpExpiresAt < new Date())
      throw new BadRequestException('Invalid or expired OTP');

    const valid = await bcrypt.compare(dto.otp, user.emailVerificationOtpHash);
    if (!valid) throw new BadRequestException('Invalid OTP');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationOtpHash: null,
        emailVerificationOtpExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully. You can now login.' };
  }

  // ── Resend Verification OTP ────────────────
  async resendVerificationOtp(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return { message: 'If that email exists, an OTP was sent' };
    if (user.emailVerified)
      return { message: 'Email is already verified. Please login.' };

    await this.issueEmailVerificationOtp(user.id, user.email);

    return { message: 'If that email exists, an OTP was sent' };
  }

  // ── Refresh Token ─────────────────────────
  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Invalid or expired refresh token');

    await this.prisma.refreshToken.delete({ where: { token } });

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
    );
    return tokens;
  }

  // ── Logout ────────────────────────────────
  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  // ── Forgot Password ───────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    await this.issuePasswordResetOtp(dto.email);

    return { message: 'If that email exists, an OTP was sent' };
  }

  // ── Resend OTP ──────────────────────────────
  async resendOtp(dto: ForgotPasswordDto) {
    await this.issuePasswordResetOtp(dto.email);

    return { message: 'If that email exists, an OTP was sent' };
  }

  // ── Reset Password ────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt)
      throw new BadRequestException('Invalid or expired OTP');
    if (user.passwordResetOtpExpiresAt < new Date())
      throw new BadRequestException('Invalid or expired OTP');

    const valid = await bcrypt.compare(dto.otp, user.passwordResetOtpHash);
    if (!valid) throw new BadRequestException('Invalid OTP');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetOtpHash: null,
        passwordResetOtpExpiresAt: null,
      },
    });

    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password reset successfully' };
  }

  // ── Helpers ───────────────────────────────
  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: this.config.get('JWT_EXPIRES_IN'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private async issuePasswordResetOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return;

    const otp = generateOTP();
    const hashed = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtpHash: hashed,
        passwordResetOtpExpiresAt: expiresAt,
      },
    });

    await this.sendOtpEmail({
      to: user.email,
      subject: 'Reset your password OTP',
      heading: 'Password reset OTP',
      otp,
      expiresInMinutes: 10,
    });
  }

  private async issueEmailVerificationOtp(userId: string, email: string) {
    const otp = generateOTP();
    const hashed = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationOtpHash: hashed,
        emailVerificationOtpExpiresAt: expiresAt,
      },
    });

    await this.sendOtpEmail({
      to: email,
      subject: 'Verify your email OTP',
      heading: 'Email verification OTP',
      otp,
      expiresInMinutes: 10,
    });
  }

  private async sendOtpEmail(params: {
    to: string;
    subject: string;
    heading: string;
    otp: string;
    expiresInMinutes: number;
  }) {
    const { to, subject, heading, otp, expiresInMinutes } = params;
    const apiKey = this.config.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new BadRequestException(
        'Email service is not configured. Set RESEND_API_KEY.',
      );
    }

    const { error } = await this.resend.emails.send({
      from: this.resendFromEmail,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>${heading}</h2>
          <p>Use the OTP below to continue:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          <p>This OTP expires in ${expiresInMinutes} minutes.</p>
        </div>
      `,
    });

    if (error) {
      throw new BadRequestException(
        `Failed to send OTP email: ${error.message}`,
      );
    }
  }

  private exclude<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(obj as any).filter(([k]) => !keys.includes(k as K)),
    ) as Omit<T, K>;
  }
}
