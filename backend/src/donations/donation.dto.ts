import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizePlainText } from '../common/sanitize.util';

export class CreateDonationDto {
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  message?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{12,19}$/, { message: 'Card number must be 12-19 digits' })
  @Transform(({ value }: { value: string | undefined }) =>
    value ? value.replace(/\s+/g, '') : value,
  )
  cardNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  @Transform(({ value }: { value: string | undefined }) =>
    value ? sanitizePlainText(value) : value,
  )
  cardHolder?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiry date must be in MM/YY format',
  })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  expiryDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  cvv?: string;
}
