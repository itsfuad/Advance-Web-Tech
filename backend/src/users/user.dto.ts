import {
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { UserStatus } from './user.entity';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class PublishNewsletterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subject: string;

  @IsString()
  @MinLength(5)
  message: string;
}
