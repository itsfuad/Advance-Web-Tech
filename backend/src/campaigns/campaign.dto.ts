import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizePlainText } from '../common/sanitize.util';

export class CreateCampaignDto {
  @IsString()
  @MaxLength(160)
  @Transform(({ value }: { value: string }) => sanitizePlainText(value))
  title: string;

  @IsString()
  @MaxLength(5000)
  @Transform(({ value }: { value: string }) => sanitizePlainText(value))
  description: string;

  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(1)
  goalAmount: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  category?: string;
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  @MaxLength(160)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  description?: string;

  @Transform(({ value }: { value: unknown }) =>
    value !== undefined ? Number(value) : value,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  goalAmount?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  category?: string;
}

export class ReportCampaignDto {
  @IsString()
  @MaxLength(500)
  @Transform(({ value }: { value: string }) => sanitizePlainText(value))
  reason: string;
}

export class AdminCampaignQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsIn(['active', 'frozen', 'closed'])
  status?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  reported?: string;

  @IsOptional()
  @IsIn(['createdAt', 'raisedAmount', 'goalAmount', 'title', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
