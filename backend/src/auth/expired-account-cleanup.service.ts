import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, IsNull, Repository } from 'typeorm';
import { User } from '../users/user.entity';

const EMAIL_VERIFICATION_WINDOW_MS = 10 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class ExpiredAccountCleanupService implements OnModuleInit {
  private readonly logger = new Logger(ExpiredAccountCleanupService.name);
  private intervalHandle?: NodeJS.Timeout;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    // Run once on startup so stale accounts are cleaned even after restarts.
    void this.cleanupExpiredUnverifiedAccounts();

    // Continue running in the background.
    this.intervalHandle = setInterval(() => {
      void this.cleanupExpiredUnverifiedAccounts();
    }, CLEANUP_INTERVAL_MS);
  }

  async cleanupExpiredUnverifiedAccounts(): Promise<void> {
    const cutoff = new Date(Date.now() - EMAIL_VERIFICATION_WINDOW_MS);

    try {
      const expiredUsers = await this.userRepository.find({
        where: {
          emailVerified: false,
          otpExpiry: LessThan(new Date()),
          createdAt: LessThan(cutoff),
        },
      });

      if (expiredUsers.length === 0) {
        return;
      }

      const deletableIds = expiredUsers
        .filter((user) => !user.emailVerified && user.createdAt)
        .map((user) => user.id);

      if (deletableIds.length === 0) {
        return;
      }

      await this.userRepository.delete(deletableIds);

      this.logger.log(
        `Deleted ${deletableIds.length} expired unverified account(s)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to clean expired unverified accounts: ${this.formatError(error)}`,
      );
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
