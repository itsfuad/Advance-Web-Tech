import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }: { value: string }) => value.trim())
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  @Transform(({ value }: { value: string }) => value.trim())
  otp: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(16)
  @MaxLength(256)
  @Transform(({ value }: { value: string }) => value.trim())
  token: string;
}
