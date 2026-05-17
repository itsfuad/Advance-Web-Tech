import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './user.entity';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateUserStatusDto,
} from './user.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
    subscription?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status && ['active', 'banned'].includes(status)) {
      qb.andWhere('user.status = :status', { status });
    }

    if (subscription === 'subscribed') {
      qb.andWhere('user.newsletterSubscribed = :subscribed', {
        subscribed: true,
      });
    } else if (subscription === 'unsubscribed') {
      qb.andWhere('user.newsletterSubscribed = :subscribed', {
        subscribed: false,
      });
    }

    const allowedSortBy: Record<string, string> = {
      createdAt: 'user.createdAt',
      name: 'user.name',
      email: 'user.email',
      status: 'user.status',
    };
    const sortColumn = allowedSortBy[sortBy || 'createdAt'] || 'user.createdAt';
    const direction = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortColumn, direction);

    const [users, total] = await qb.getManyAndCount();
    return {
      data: users.map(({ password, otpCode, otpExpiry, ...u }) => ({
        ...u,
        emailVerified: u.emailVerified,
        emailVerifiedAt: u.emailVerifiedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, otpCode, otpExpiry, ...profile } = user;
    return {
      ...profile,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async getPublicProfile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    profileImage?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before updating your profile',
      );
    }

    if (dto.name) user.name = dto.name;
    if (profileImage) user.profileImage = profileImage;

    await this.userRepository.save(user);
    const { password, otpCode, otpExpiry, ...profile } = user;
    return {
      ...profile,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid)
      throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const previousStatus = user.status;
    const nextStatus = dto.status;

    if (previousStatus === nextStatus) {
      const { password, otpCode, otpExpiry, ...profile } = user;
      return {
        ...profile,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      };
    }

    const emailSent = await this.emailService.sendUserStatusEmail(
      user.email,
      user.name,
      previousStatus,
      nextStatus,
    );

    if (!emailSent) {
      throw new BadRequestException('Failed to send status notification email');
    }

    await this.userRepository.update(user.id, { status: nextStatus });
    const updated = await this.userRepository.findOne({ where: { id: user.id } });
    if (!updated) throw new NotFoundException('User not found');
    const { password, otpCode, otpExpiry, ...profile } = updated;
    return {
      ...profile,
      emailVerified: updated.emailVerified,
      emailVerifiedAt: updated.emailVerifiedAt,
    };
  }

  async subscribeToNewsletter(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.newsletterSubscribed) {
      return { subscribed: true, message: 'Already subscribed to newsletter' };
    }

    user.newsletterSubscribed = true;
    await this.userRepository.save(user);
    return { subscribed: true, message: 'Subscribed to newsletter' };
  }

  async unsubscribeFromNewsletter(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.newsletterSubscribed) {
      return { subscribed: false, message: 'Already unsubscribed' };
    }

    user.newsletterSubscribed = false;
    await this.userRepository.save(user);
    return { subscribed: false, message: 'Unsubscribed from newsletter' };
  }

  async publishNewsletter(subject: string, message: string) {
    const users = await this.userRepository.find({
      where: { newsletterSubscribed: true },
    });

    if (users.length === 0) {
      return { sent: false, recipients: 0, message: 'No subscribers found' };
    }

    let sentCount = 0;
    for (const user of users) {
      if (!user.newsletterUnsubscribeToken) {
        user.newsletterUnsubscribeToken = randomBytes(32).toString('hex');
        await this.userRepository.save(user);
      }
      const sent = await this.emailService.sendNewsletterEmail(
        user.email,
        subject,
        message,
        user.newsletterUnsubscribeToken,
      );
      if (sent) {
        sentCount += 1;
      }
    }

    if (sentCount === 0) {
      throw new BadRequestException('Failed to send newsletter email');
    }

    return { sent: true, recipients: sentCount };
  }

  async unsubscribeFromNewsletterLink(token?: string) {
    if (!token) {
      throw new BadRequestException('Invalid unsubscribe link');
    }
    const user = await this.userRepository.findOne({
      where: { newsletterUnsubscribeToken: token },
    });
    if (!user) {
      throw new NotFoundException('Invalid unsubscribe link');
    }
    if (!user.newsletterSubscribed) {
      return { unsubscribed: true, message: 'Already unsubscribed' };
    }

    user.newsletterSubscribed = false;
    await this.userRepository.save(user);
    return { unsubscribed: true, message: 'You have been unsubscribed' };
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
