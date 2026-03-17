import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Donation, DonationStatus } from './donation.entity';
import { Campaign, CampaignStatus } from '../campaigns/campaign.entity';
import { CreateDonationDto } from './donation.dto';
import { CampaignsService } from '../campaigns/campaigns.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    private campaignsService: CampaignsService,
  ) {}

  async donate(campaignId: string, donorId: string, dto: CreateDonationDto) {
    const campaign = await this.campaignsService.findOne(campaignId);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not accepting donations');
    }

    if (campaign.creatorId === donorId) {
      throw new BadRequestException('Cannot donate to your own campaign');
    }

    // Mock payment processing
    const paymentResult = await this.processMockPayment(dto);

    const donation = this.donationRepository.create({
      amount: dto.amount,
      message: dto.message,
      donorId,
      campaignId,
      status: paymentResult.success ? DonationStatus.COMPLETED : DonationStatus.FAILED,
      transactionId: paymentResult.transactionId,
    });

    await this.donationRepository.save(donation);

    if (paymentResult.success) {
      await this.campaignsService.addRaisedAmount(campaignId, dto.amount);
    } else {
      throw new BadRequestException('Payment failed: ' + paymentResult.error);
    }

    return {
      donation,
      payment: {
        transactionId: paymentResult.transactionId,
        status: 'success',
        message: 'Payment processed successfully',
      },
    };
  }

  private async processMockPayment(dto: CreateDonationDto): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (dto.cardNumber && dto.cardNumber.replace(/\s/g, '').startsWith('0000')) {
      return { success: false, error: 'Card declined' };
    }

    // 95% success rate simulation
    const success = Math.random() > 0.05;
    if (!success) {
      return { success: false, error: 'Payment gateway error. Please try again.' };
    }

    return {
      success: true,
      transactionId: `TXN-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`,
    };
  }

  async findByCampaign(campaignId: string, page = 1, limit = 20) {
    const [data, total] = await this.donationRepository.findAndCount({
      where: { campaignId, status: DonationStatus.COMPLETED },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findByDonor(donorId: string, page = 1, limit = 20) {
    const [data, total] = await this.donationRepository.findAndCount({
      where: { donorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getPlatformStats() {
    const totalDonations = await this.donationRepository
      .createQueryBuilder('d')
      .where('d.status = :status', { status: DonationStatus.COMPLETED })
      .getCount();

    const totalAmountResult = await this.donationRepository
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'total')
      .where('d.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();

    return {
      totalDonations,
      totalAmount: parseFloat(totalAmountResult?.total ?? 0),
    };
  }

  async getUserDonationStats(userId: string) {
    const totalDonated = await this.donationRepository
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'total')
      .where('d.donorId = :userId AND d.status = :status', {
        userId,
        status: DonationStatus.COMPLETED,
      })
      .getRawOne();

    const donationCount = await this.donationRepository.count({
      where: { donorId: userId, status: DonationStatus.COMPLETED },
    });

    return {
      totalDonated: parseFloat(totalDonated?.total ?? 0),
      donationCount,
    };
  }
}
