import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
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
  category?: string;
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
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
  category?: string;
}

export class ReportCampaignDto {
  @IsString()
  reason: string;
}
