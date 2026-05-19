import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/user.entity';
import { EmailModule } from '../email/email.module';
import { ExpiredAccountCleanupService } from './expired-account-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as
            | number
            | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
        },
      }),
    }),
    EmailModule,
  ],
  providers: [AuthService, JwtStrategy, ExpiredAccountCleanupService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
