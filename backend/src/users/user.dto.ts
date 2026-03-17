import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
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
