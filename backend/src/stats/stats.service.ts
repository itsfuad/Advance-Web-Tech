import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Campaign, CampaignStatus } from '../campaigns/campaign.entity';
import { Donation, DonationStatus } from '../donations/donation.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async getPlatformStats() {
    const totalUsers = await this.userRepository.count();

    const totalCampaigns = await this.campaignRepository.count();
    const activeCampaigns = await this.campaignRepository.count({
      where: { status: CampaignStatus.ACTIVE },
    });
    const frozenCampaigns = await this.campaignRepository.count({
      where: { status: CampaignStatus.FROZEN },
    });
    const reportedCampaigns = await this.campaignRepository.count({
      where: { reported: true },
    });

    const totalDonations = await this.donationRepository.count({
      where: { status: DonationStatus.COMPLETED },
    });

    const totalRaisedResult = await this.donationRepository
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'total')
      .where('d.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();

    const recentDonations = await this.donationRepository.find({
      where: { status: DonationStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const topCampaigns = await this.campaignRepository.find({
      order: { raisedAmount: 'DESC' },
      take: 5,
    });

    return {
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      frozenCampaigns,
      reportedCampaigns,
      totalDonations,
      totalRaised: parseFloat(totalRaisedResult?.total ?? 0),
      recentDonations,
      topCampaigns,
    };
  }

  async getUserStats(userId: string) {
    const campaigns = await this.campaignRepository.find({
      where: { creatorId: userId },
    });

    const totalRaisedResult = await this.campaignRepository
      .createQueryBuilder('c')
      .select('SUM(c.raisedAmount)', 'total')
      .where('c.creatorId = :userId', { userId })
      .getRawOne();

    const donationsMadeResult = await this.donationRepository
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'total')
      .where('d.donorId = :userId AND d.status = :status', {
        userId,
        status: DonationStatus.COMPLETED,
      })
      .getRawOne();

    const donationsMadeCount = await this.donationRepository.count({
      where: { donorId: userId, status: DonationStatus.COMPLETED },
    });

    const recentDonations = await this.donationRepository.find({
      where: { donorId: userId, status: DonationStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      campaignsCreated: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
      totalRaised: parseFloat(totalRaisedResult?.total ?? 0),
      donationsMade: donationsMadeCount,
      totalDonated: parseFloat(donationsMadeResult?.total ?? 0),
      recentDonations,
      campaigns,
    };
  }
}
