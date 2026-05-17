import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as fs from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  ['uploads/profiles', 'uploads/campaigns', 'uploads/tmp'].forEach((dir) => {
    const fullPath = join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  const sanitizeUploads = () => {
    const tempDir = join(process.cwd(), 'uploads/tmp');
    const maxAgeMs = 15 * 60 * 1000;
    const now = Date.now();

    if (!fs.existsSync(tempDir)) return;

    for (const filename of fs.readdirSync(tempDir)) {
      const filePath = join(tempDir, filename);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ignore files that are already gone or unreadable
      }
    }
  };

  sanitizeUploads();
  setInterval(sanitizeUploads, 10 * 60 * 1000);

  const dataSource = app.get(DataSource);
  await dataSource
    .getRepository(User)
    .createQueryBuilder()
    .update(User)
    .set({ status: 'banned' as User['status'] })
    .where('status = :blocked', { blocked: 'blocked' })
    .execute();

  // Cleanup legacy DB constraints that still reference "blocked"
  const blockedConstraints: Array<{ conname: string }> = await dataSource.query(
    `
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'users'
        AND c.contype = 'c'
        AND pg_get_constraintdef(c.oid) ILIKE '%status%'
        AND pg_get_constraintdef(c.oid) ILIKE '%blocked%'
    `,
  );
  for (const constraint of blockedConstraints) {
    await dataSource.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS "${constraint.conname}"`,
    );
  }

  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'users'
          AND c.conname = 'users_status_check'
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_status_check
        CHECK (status IN ('active', 'banned'));
      END IF;
    END$$;
  `);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    console.log('[DEV] SMTP config loaded', {
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      user: config.get('SMTP_USER'),
      from: config.get('SMTP_FROM'),
      passSet: Boolean(config.get('SMTP_PASS')),
    });
  }
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}

bootstrap();
