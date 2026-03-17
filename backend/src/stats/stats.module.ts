import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User } from '../users/user.entity';
import { Campaign } from '../campaigns/campaign.entity';
import { Donation } from '../donations/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Campaign, Donation])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
