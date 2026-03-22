import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './user.entity';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateUserStatusDto,
} from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
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

    user.status = dto.status;
    await this.userRepository.save(user);

    const { password, otpCode, otpExpiry, ...profile } = user;
    return {
      ...profile,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
