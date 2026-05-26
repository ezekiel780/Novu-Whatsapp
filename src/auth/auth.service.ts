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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.exclude(user, ['password']), ...tokens };
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.exclude(user, ['password']), ...tokens };
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return { message: 'If that email exists, an OTP was sent' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(otp, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: `otp:${hashed}` },
    });

    // TODO: Send OTP via email service
    console.log(`OTP for ${user.email}: ${otp}`);

    return { message: 'If that email exists, an OTP was sent' };
  }

  // ── Reset Password ────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.status?.startsWith('otp:'))
      throw new BadRequestException('Invalid or expired OTP');

    const storedHash = user.status.replace('otp:', '');
    const valid = await bcrypt.compare(dto.otp, storedHash);
    if (!valid) throw new BadRequestException('Invalid OTP');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, status: null },
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

  private exclude<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(obj as any).filter(([k]) => !keys.includes(k as K)),
    ) as Omit<T, K>;
  }
}
