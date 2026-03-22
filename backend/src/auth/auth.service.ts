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
import { randomBytes } from 'crypto';
import { User, UserStatus } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './auth.dto';

const EMAIL_VERIFICATION_WINDOW_MS = 10 * 60 * 1000;
const OTP_EXPIRE_TIME = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_WINDOW_MS,
    );

    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      emailVerified: false,
      emailVerifiedAt: null,
      otpCode: emailVerificationToken,
      otpExpiry: emailVerificationExpiresAt,
    });
    await this.userRepository.save(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(user.email)}`;

    this.emailService
      .sendEmailVerificationEmail(user.email, user.name, verificationLink)
      .catch(() => {});

    this.emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    setTimeout(() => {
      void this.deleteUnverifiedAccount(user.id, { skipAgeCheck: true }).catch(
        () => {},
      );
    }, EMAIL_VERIFICATION_WINDOW_MS);

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account is blocked. Contact support');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async resendEmailVerification(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_WINDOW_MS,
    );

    user.otpCode = null;
    user.otpExpiry = null;
    user.otpCode = emailVerificationToken;
    user.otpExpiry = emailVerificationExpiresAt;
    await this.userRepository.save(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(user.email)}`;

    this.emailService
      .sendEmailVerificationEmail(user.email, user.name, verificationLink)
      .catch(() => {});

    return { message: 'Verification email sent' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Account not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + OTP_EXPIRE_TIME);

    user.otpCode = null;
    user.otpExpiry = null;
    user.otpCode = otp;
    user.otpExpiry = expiry;
    await this.userRepository.save(user);

    await this.emailService.sendOtpEmail(
      user.email,
      otp,
      user.name,
      Math.round(OTP_EXPIRE_TIME / 60000),
    );

    return { message: 'OTP has been sent to your email' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
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
    const { ...profile } = user;
    return {
      ...profile,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid verification request');
    }

    if (!user.otpCode || user.otpCode !== dto.token) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      throw new BadRequestException('Verification token has expired');
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.otpCode = null;
    user.otpExpiry = null;
    await this.userRepository.save(user);

    const { ...profile } = user;
    return {
      message: 'Email verified successfully',
      user: profile,
    };
  }

  async deleteUnverifiedAccount(
    userId: string,
    options: { skipAgeCheck?: boolean } = {},
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException(
        'Verified accounts cannot be deleted using this action',
      );
    }

    if (!user.createdAt) {
      throw new BadRequestException('Account deletion is unavailable');
    }

    if (!options.skipAgeCheck) {
      const ageMs = Date.now() - new Date(user.createdAt).getTime();
      if (ageMs > EMAIL_VERIFICATION_WINDOW_MS) {
        throw new BadRequestException('Deletion window has expired');
      }
    }

    await this.userRepository.delete(user.id);
    return { message: 'Account deleted successfully' };
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { ...userInfo } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...userInfo,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }
}
