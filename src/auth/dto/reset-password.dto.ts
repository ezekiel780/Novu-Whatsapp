import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsIn(['verification', 'password-reset'])
  purpose?: 'verification' | 'password-reset';
}
