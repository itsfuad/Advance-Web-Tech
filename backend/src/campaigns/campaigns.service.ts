import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './campaign.entity';
import { UserRole } from '../users/user.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ReportCampaignDto,
} from './campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async findAll(page = 1, limit = 12, category?: string, search?: string) {
    const qb = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.creator', 'creator')
      .where('campaign.status != :frozen', { frozen: CampaignStatus.FROZEN });

    if (category) {
      qb.andWhere('campaign.category = :category', { category });
    }

    if (search) {
      qb.andWhere(
        '(campaign.title LIKE :search OR campaign.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('campaign.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findAllAdmin(page = 1, limit = 20) {
    const [data, total] = await this.campaignRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async findByCreator(creatorId: string, page = 1, limit = 12) {
    const [data, total] = await this.campaignRepository.findAndCount({
      where: { creatorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async create(creatorId: string, dto: CreateCampaignDto, coverImage?: string) {
    const campaign = this.campaignRepository.create({
      ...dto,
      goalAmount: Number(dto.goalAmount),
      creatorId,
      coverImage,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
    return this.campaignRepository.save(campaign);
  }

  async update(
    id: string,
    userId: string,
    role: UserRole,
    dto: UpdateCampaignDto,
    coverImage?: string,
  ) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.creatorId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to edit this campaign');
    }

    if (campaign.status === CampaignStatus.FROZEN && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot edit a frozen campaign');
    }

    if (dto.title !== undefined) campaign.title = dto.title;
    if (dto.description !== undefined) campaign.description = dto.description;
    if (dto.goalAmount !== undefined && dto.goalAmount !== null) {
      campaign.goalAmount = Number(dto.goalAmount);
    }
    if (dto.deadline !== undefined) campaign.deadline = new Date(dto.deadline);
    if (dto.category !== undefined) campaign.category = dto.category;
    if (coverImage) campaign.coverImage = coverImage;

    return this.campaignRepository.save(campaign);
  }

  async delete(id: string, userId: string, role: UserRole) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.creatorId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to delete this campaign');
    }

    await this.campaignRepository.remove(campaign);
    return { message: 'Campaign deleted successfully' };
  }

  async report(id: string, userId: string, dto: ReportCampaignDto) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.creatorId === userId) {
      throw new BadRequestException('Cannot report your own campaign');
    }

    campaign.reported = true;
    campaign.reportReason = dto.reason;
    return this.campaignRepository.save(campaign);
  }

  async freeze(id: string) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = CampaignStatus.FROZEN;
    return this.campaignRepository.save(campaign);
  }

  async unfreeze(id: string) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepository.save(campaign);
  }

  async getReported(page = 1, limit = 20) {
    const [data, total] = await this.campaignRepository.findAndCount({
      where: { reported: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async addRaisedAmount(campaignId: string, amount: number) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.raisedAmount += amount;
    return this.campaignRepository.save(campaign);
  }
}
