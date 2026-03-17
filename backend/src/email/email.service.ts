import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string, name: string): Promise<void> {
    const fromEmail = this.configService.get('SMTP_FROM', 'noreply@fundrise.com');
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
            <p style="color: #333;">You requested a password reset. Use the OTP below to reset your password. This code expires in <strong>10 minutes</strong>.</p>
            <div style="background: #f5f5f5; border: 2px dashed #000; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email. Your account remains secure.</p>
          </div>
          <div style="background: #f5f5f5; padding: 16px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2024 FundRise. All rights reserved.</p>
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
    const fromEmail = this.configService.get('SMTP_FROM', 'noreply@fundrise.com');
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
            <h2 style="color: #000; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #333;">Thank you for joining FundRise. You can now create campaigns, donate to causes you care about, and make a difference.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}" style="background: #000; color: #fff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-weight: bold;">Get Started</a>
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 16px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2024 FundRise. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`);
    }
  }
}
