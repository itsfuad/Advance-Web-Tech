import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as fs from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

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
