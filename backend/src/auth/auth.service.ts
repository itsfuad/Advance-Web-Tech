import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account is blocked');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If this email exists, an OTP has been sent' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.update(user.id, {
      otpCode: otp,
      otpExpiry: expiry,
    });

    await this.emailService.sendOtpEmail(user.email, otp, user.name);

    return { message: 'If this email exists, an OTP has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new BadRequestException('Invalid OTP or email');
    }

    if (!user.otpCode || user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      otpCode: null,
      otpExpiry: null,
    });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, otpCode, otpExpiry, ...profile } = user;
    return profile;
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, otpCode, otpExpiry, ...userInfo } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: userInfo,
    };
  }
}
