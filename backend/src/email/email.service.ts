import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const smtpPort = this.configService.get<string>('SMTP_PORT');
    if (!smtpPort) {
      throw new Error('SMTP_PORT is not configured');
    }
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(smtpPort, 10),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    name: string,
    expiresInMinutes: number,
  ): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM');
    const mailOptions = {
      from: `"FundRise" <${fromEmail}>`,
      to,
      subject: 'Password Reset OTP - FundRise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">FUNDRISE</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #333;">Hi ${name},</p>
            <p style="color: #333;">You requested a password reset. Use the OTP below to reset your password. This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
            <div style="background: #f5f5f5; border: 2px dashed #000; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
      // In development, log OTP to console
      this.logger.warn(`[DEV] OTP for ${to}: ${otp}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM');
    const mailOptions = {
      from: `"FundRise" <${fromEmail}>`,
      to,
      subject: 'Welcome to FundRise!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">FUNDRISE</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Welcome to FundRise, ${name}!</h2>
            <p style="color: #333; line-height: 1.6;">Your account has been created successfully. Start exploring campaigns, creating your own, and making a difference today.</p>
            <div style="margin: 32px 0;">
              <a href="#" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Get Started</a>
            </div>
            <p style="color: #666; font-size: 14px;">Thank you for joining our community!</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${to}: ${error.message}`,
      );
    }
  }

  async sendEmailVerificationEmail(
    to: string,
    name: string,
    link: string,
  ): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM');
    const mailOptions = {
      from: `"FundRise" <${fromEmail}>`,
      to,
      subject: 'Verify your FundRise email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">FUNDRISE</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Verify your email, ${name}</h2>
            <p style="color: #333; line-height: 1.6;">Please verify your email address to unlock campaign creation and donations.</p>
            <p style="color: #333; line-height: 1.6;">If you do not verify within 10 minutes, your account will be deleted from our system.</p>
            <div style="margin: 32px 0;">
              <a href="${link}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${to}: ${error.message}`,
      );
    }
  }

  async sendUserStatusEmail(
    to: string,
    name: string,
    previousStatus: string,
    currentStatus: string,
  ): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM');
    const subjectMap: Record<string, string> = {
      banned: 'Your FundRise account has been banned',
      blocked: 'Your FundRise account has been blocked',
      active: 'Your FundRise account has been reactivated',
    };
    const subject = subjectMap[currentStatus] ?? 'Account status updated';
    const mailOptions = {
      from: `"FundRise" <${fromEmail}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">FUNDRISE</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Account status update</h2>
            <p style="color: #333;">Hi ${name},</p>
            <p style="color: #333; line-height: 1.6;">
              Your account status has changed from <strong>${previousStatus}</strong> to
              <strong>${currentStatus}</strong> by an administrator.
            </p>
            <p style="color: #666; font-size: 14px;">If you believe this is a mistake, please contact support.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Status email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send status email to ${to}: ${error.message}`,
      );
    }
  }

  async sendCampaignStatusEmail(
    to: string,
    name: string,
    campaignTitle: string,
    status: string,
  ): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM');
    const subject =
      status === 'frozen'
        ? 'Your FundRise campaign has been frozen'
        : 'Your FundRise campaign is active again';
    const mailOptions = {
      from: `"FundRise" <${fromEmail}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">FUNDRISE</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #000; margin-top: 0;">Campaign status update</h2>
            <p style="color: #333;">Hi ${name},</p>
            <p style="color: #333; line-height: 1.6;">
              Your campaign <strong>${campaignTitle}</strong> is now marked as
              <strong>${status}</strong> by an administrator.
            </p>
            <p style="color: #666; font-size: 14px;">If you believe this is a mistake, please contact support.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Campaign status email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send campaign status email to ${to}: ${error.message}`,
      );
    }
  }
}
