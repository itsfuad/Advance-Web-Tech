import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'fundrise.db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  } as any);

  await dataSource.initialize();

  const userRepo = dataSource.getRepository('users');

  // Check if admin exists
  const adminExists = await userRepo.findOne({ where: { email: 'admin@fundrise.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    await userRepo.save({
      email: 'admin@fundrise.com',
      name: 'Platform Admin',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin created: admin@fundrise.com / Admin@123456');
  } else {
    console.log('Admin already exists');
  }

  await dataSource.destroy();
}

seed().catch(console.error);
