import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Donation, DonationStatus, PaymentMethod } from './donation.entity';
import { Campaign, CampaignStatus } from '../campaigns/campaign.entity';
import { CapturePaypalOrderDto, CreateDonationDto, CreatePaypalOrderDto } from './donation.dto';
import { CampaignsService } from '../campaigns/campaigns.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    private campaignsService: CampaignsService,
    private configService: ConfigService,
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
      paymentMethod: PaymentMethod.CARD,
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
    this.validateCardPaymentFields(dto);

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

  private validateCardPaymentFields(dto: CreateDonationDto) {
    if (!dto.cardNumber || !dto.expiryDate || !dto.cvv) {
      throw new BadRequestException('Card details are required');
    }

    const [monthRaw, yearRaw] = dto.expiryDate.split('/');
    const month = Number(monthRaw);
    const year = Number(`20${yearRaw}`);
    if (!month || !year || month < 1 || month > 12) {
      throw new BadRequestException('Invalid card expiry date');
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new BadRequestException('Card has expired');
    }
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

  async createPaypalOrder(
    campaignId: string,
    donorId: string,
    dto: CreatePaypalOrderDto,
  ) {
    const campaign = await this.campaignsService.findOne(campaignId);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not accepting donations');
    }
    if (campaign.creatorId === donorId) {
      throw new BadRequestException('Cannot donate to your own campaign');
    }

    const accessToken = await this.getPaypalAccessToken();
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/campaigns/${campaignId}?paypal=success`;
    const cancelUrl = `${frontendUrl}/campaigns/${campaignId}?paypal=cancel`;

    const response = await fetch(
      `${this.getPaypalApiBase()}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: dto.amount.toFixed(2),
              },
              custom_id: `${campaignId}:${donorId}`,
            },
          ],
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        data?.message || 'Failed to create PayPal order',
      );
    }

    const approveLink = (data?.links || []).find(
      (link: { rel?: string }) => link.rel === 'approve',
    )?.href;
    if (!approveLink) {
      throw new InternalServerErrorException('PayPal approve URL not found');
    }

    return { orderId: data.id, approveUrl: approveLink };
  }

  async capturePaypalOrder(
    campaignId: string,
    donorId: string,
    dto: CapturePaypalOrderDto,
  ) {
    const campaign = await this.campaignsService.findOne(campaignId);
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not accepting donations');
    }
    if (campaign.creatorId === donorId) {
      throw new BadRequestException('Cannot donate to your own campaign');
    }

    const accessToken = await this.getPaypalAccessToken();
    const captureResponse = await fetch(
      `${this.getPaypalApiBase()}/v2/checkout/orders/${dto.orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const captureData = await captureResponse.json();
    if (!captureResponse.ok) {
      throw new BadRequestException(
        captureData?.message || 'Failed to capture PayPal payment',
      );
    }

    const orderStatus = captureData?.status;
    if (!['COMPLETED', 'APPROVED'].includes(orderStatus)) {
      throw new BadRequestException('PayPal order is not completed');
    }

    const capturedAmountRaw =
      captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    const capturedAmount = Number(capturedAmountRaw);
    if (!capturedAmount || Number.isNaN(capturedAmount) || capturedAmount <= 0) {
      throw new BadRequestException('Invalid captured amount from PayPal');
    }

    const transactionId =
      captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      `PP-${dto.orderId}`;

    const existing = await this.donationRepository.findOne({
      where: { transactionId },
    });
    if (existing) {
      return {
        donation: existing,
        payment: {
          transactionId: existing.transactionId,
          status: 'success',
          message: 'Payment already captured',
        },
      };
    }

    const donation = this.donationRepository.create({
      amount: capturedAmount,
      message: dto.message,
      donorId,
      campaignId,
      status: DonationStatus.COMPLETED,
      transactionId,
      paymentMethod: PaymentMethod.PAYPAL,
    });

    await this.donationRepository.save(donation);
    await this.campaignsService.addRaisedAmount(campaignId, capturedAmount);

    return {
      donation,
      payment: {
        transactionId,
        status: 'success',
        message: 'PayPal payment captured successfully',
      },
    };
  }

  async handlePaypalWebhook(headers: Record<string, string>, event: unknown) {
    const webhookId = this.configService.get<string>('PP_WEBHOOK_ID');
    if (!webhookId) {
      throw new BadRequestException('PayPal webhook ID is not configured');
    }

    const accessToken = await this.getPaypalAccessToken();
    const response = await fetch(
      `${this.getPaypalApiBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: event,
        }),
      },
    );
    const verifyResult = await response.json();
    if (!response.ok || verifyResult?.verification_status !== 'SUCCESS') {
      throw new BadRequestException('Invalid PayPal webhook signature');
    }

    return { received: true };
  }

  private getPaypalApiBase() {
    const env = this.configService.get<string>('PP_ENV', 'sandbox');
    return env === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getPaypalAccessToken() {
    const clientId = this.configService.get<string>('PP_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PP_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('PayPal credentials are not set');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const response = await fetch(`${this.getPaypalApiBase()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (!response.ok || !data?.access_token) {
      throw new InternalServerErrorException('Failed to authenticate PayPal');
    }
    return data.access_token as string;
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
