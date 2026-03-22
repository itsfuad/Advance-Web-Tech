import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators';
import { UserRole } from '../users/user.entity';

@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Post('campaign/:campaignId')
  donate(
    @Param('campaignId') campaignId: string,
    @Request() req,
    @Body(new ValidationPipe({ transform: true })) dto: CreateDonationDto,
  ) {
    if (req.user?.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admins cannot make donations');
    }
    if (!req.user?.emailVerified) {
      throw new ForbiddenException('Please verify your email before donating');
    }

    return this.donationsService.donate(campaignId, req.user.id, dto);
  }

  @Public()
  @Get('campaign/:campaignId')
  findByCampaign(
    @Param('campaignId') campaignId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.donationsService.findByCampaign(campaignId, page, limit);
  }

  @Get('my')
  findMyDonations(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.donationsService.findByDonor(req.user.id, page, limit);
  }
}
