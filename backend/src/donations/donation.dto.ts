import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  message?: string;

  // Mock payment fields
  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  @IsOptional()
  cardHolder?: string;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  cvv?: string;
}
