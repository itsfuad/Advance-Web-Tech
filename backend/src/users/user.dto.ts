import {
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserStatus } from './user.entity';
import { sanitizePlainText } from '../common/sanitize.util';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
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
  @Transform(({ value }: { value: string }) => sanitizePlainText(value))
  subject: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  @Transform(({ value }: { value: string }) => sanitizePlainText(value))
  message: string;
}

export class UserListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsIn(['active', 'banned'])
  status?: string;

  @IsOptional()
  @IsIn(['subscribed', 'unsubscribed'])
  subscription?: string;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'email', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
