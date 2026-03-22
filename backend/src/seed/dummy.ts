import 'reflect-metadata';
import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Campaign, CampaignStatus } from '../campaigns/campaign.entity';
import { Donation, DonationStatus } from '../donations/donation.entity';

const AVATARS = [
  'https://i.pravatar.cc/300?img=12',
  'https://i.pravatar.cc/300?img=32',
  'https://i.pravatar.cc/300?img=45',
  'https://i.pravatar.cc/300?img=56',
  'https://i.pravatar.cc/300?img=68',
  'https://i.pravatar.cc/300?img=72',
  'https://i.pravatar.cc/300?img=15',
  'https://i.pravatar.cc/300?img=22',
];

const COVERS = [
  'https://picsum.photos/seed/fundrise-technology/1200/800',
  'https://picsum.photos/seed/fundrise-health/1200/800',
  'https://picsum.photos/seed/fundrise-education/1200/800',
  'https://picsum.photos/seed/fundrise-community/1200/800',
  'https://picsum.photos/seed/fundrise-environment/1200/800',
  'https://picsum.photos/seed/fundrise-arts/1200/800',
  'https://picsum.photos/seed/fundrise-business/1200/800',
  'https://picsum.photos/seed/fundrise-charity/1200/800',
];

type DummyUserSeed = {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked' | 'banned';
  emailVerified: boolean;
  verifiedMinutesAgo: number;
  profileImage: string;
};

type DummyCampaignSeed = {
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  coverImage: string;
  status: CampaignStatus;
  category: string;
};

const DUMMY_USERS: DummyUserSeed[] = [
  {
    email: 'admin@fundrise.com',
    name: 'Platform Admin',
    password: 'Admin@123456',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[0],
  },
  {
    email: 'sara.ahmed@example.com',
    name: 'Sara Ahmed',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[1],
  },
  {
    email: 'mike.johnson@example.com',
    name: 'Mike Johnson',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[2],
  },
  {
    email: 'nora.khan@example.com',
    name: 'Nora Khan',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: false,
    verifiedMinutesAgo: 6,
    profileImage: AVATARS[3],
  },
  {
    email: 'david.lee@example.com',
    name: 'David Lee',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[4],
  },
  {
    email: 'emily.ross@example.com',
    name: 'Emily Ross',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[5],
  },
  {
    email: 'ali.hassan@example.com',
    name: 'Ali Hassan',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: false,
    verifiedMinutesAgo: 11,
    profileImage: AVATARS[6],
  },
  {
    email: 'lina.patel@example.com',
    name: 'Lina Patel',
    password: 'Password@123',
    role: 'user',
    status: 'active',
    emailVerified: true,
    verifiedMinutesAgo: 0,
    profileImage: AVATARS[7],
  },
];

const DUMMY_CAMPAIGNS: DummyCampaignSeed[] = [
  {
    title: 'Community Health Access Fund',
    description:
      'Helping low-income families access essential healthcare, medication support, and emergency treatment.',
    goalAmount: 25000,
    raisedAmount: 8600,
    coverImage: COVERS[1],
    status: CampaignStatus.ACTIVE,
    category: 'Health',
  },
  {
    title: 'Girls in STEM Initiative',
    description:
      'Funding workshops, devices, and mentorship for young women pursuing science and technology.',
    goalAmount: 40000,
    raisedAmount: 17250,
    coverImage: COVERS[0],
    status: CampaignStatus.ACTIVE,
    category: 'Technology',
  },
  {
    title: 'Neighborhood Learning Hub',
    description:
      'Creating a community learning space with books, internet access, and tutoring support.',
    goalAmount: 18000,
    raisedAmount: 9400,
    coverImage: COVERS[2],
    status: CampaignStatus.ACTIVE,
    category: 'Education',
  },
  {
    title: 'Urban Garden Project',
    description:
      'Building sustainable green spaces that improve food access and community well-being.',
    goalAmount: 12000,
    raisedAmount: 5100,
    coverImage: COVERS[4],
    status: CampaignStatus.ACTIVE,
    category: 'Environment',
  },
  {
    title: 'Local Arts for All',
    description:
      'Supporting artists with materials, exhibitions, and creative youth programs.',
    goalAmount: 15000,
    raisedAmount: 3200,
    coverImage: COVERS[5],
    status: CampaignStatus.ACTIVE,
    category: 'Arts',
  },
  {
    title: 'Small Business Starter Grants',
    description:
      'Helping first-time entrepreneurs with micro-grants, mentorship, and practical business support.',
    goalAmount: 30000,
    raisedAmount: 12450,
    coverImage: COVERS[6],
    status: CampaignStatus.ACTIVE,
    category: 'Business',
  },
  {
    title: 'Community Food Relief Drive',
    description:
      'Providing food, supplies, and urgent assistance to families in crisis.',
    goalAmount: 20000,
    raisedAmount: 9900,
    coverImage: COVERS[7],
    status: CampaignStatus.ACTIVE,
    category: 'Community',
  },
];

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

function buildCampaignSeed(
  seed: DummyCampaignSeed,
  creatorId: string,
): DeepPartial<Campaign> {
  return {
    title: seed.title,
    description: seed.description,
    goalAmount: seed.goalAmount,
    raisedAmount: seed.raisedAmount,
    coverImage: seed.coverImage,
    status: seed.status,
    category: seed.category,
    creatorId,
    deadline: new Date(Date.now() + 30 * 60 * 1000),
    reported: false,
  };
}

export async function seedDatabase(
  dataSource: DataSource,
  mode: 'create' | 'reset' = 'create',
) {
  const userRepo = dataSource.getRepository(User);
  const campaignRepo = dataSource.getRepository(Campaign);
  const donationRepo = dataSource.getRepository(Donation);

  if (mode === 'reset') {
    await donationRepo.clear();
    await campaignRepo.clear();
    await userRepo.createQueryBuilder().delete().execute();
    console.log('Existing data cleared.');
  }

  console.log('Seeding dummy users and campaigns...');

  for (const seedUser of DUMMY_USERS) {
    const existing = await userRepo.findOne({
      where: { email: seedUser.email },
    });

    if (existing) continue;

    const hashedPassword = await bcrypt.hash(seedUser.password, 12);

    const user = userRepo.create({
      email: seedUser.email,
      name: seedUser.name,
      password: hashedPassword,
      role: seedUser.role,
      status: seedUser.status,
      emailVerified: seedUser.emailVerified,
      emailVerifiedAt: seedUser.emailVerified ? new Date() : null,
      profileImage: seedUser.profileImage,
      otpCode: seedUser.emailVerified ? null : `seed-token-${seedUser.email}`,
      otpExpiry: seedUser.emailVerified
        ? null
        : minutesAgo(seedUser.verifiedMinutesAgo),
    } as DeepPartial<User>);

    await userRepo.save(user);
    console.log(`Created user: ${seedUser.email}`);
  }

  const allUsers = await userRepo.find({
    order: { createdAt: 'ASC' },
  });

  const nonAdminUsers = allUsers.filter(
    (user) => user.email !== 'admin@fundrise.com',
  );
  const verifiedUsers = nonAdminUsers.filter((user) => user.emailVerified);

  for (const campaignSeed of DUMMY_CAMPAIGNS) {
    const existing = await campaignRepo.findOne({
      where: { title: campaignSeed.title },
    });

    if (existing) continue;

    const creator =
      verifiedUsers[Math.floor(Math.random() * verifiedUsers.length)] ||
      nonAdminUsers[0] ||
      allUsers[0];

    if (!creator) continue;

    const campaign = await campaignRepo.save(
      campaignRepo.create(buildCampaignSeed(campaignSeed, creator.id)),
    );

    console.log(`Created campaign: ${campaignSeed.title}`);

    const donorPool = allUsers.filter(
      (user) =>
        user.id !== creator.id &&
        user.emailVerified &&
        user.email !== 'admin@fundrise.com',
    );

    const donationCount = Math.max(1, Math.floor(Math.random() * 3));
    for (let i = 0; i < donationCount; i++) {
      const donor =
        donorPool[Math.floor(Math.random() * donorPool.length)] || donorPool[0];

      if (!donor) continue;

      const amount = Math.max(
        25,
        Math.floor(
          (campaignSeed.raisedAmount / donationCount) *
            (0.6 + Math.random() * 0.8),
        ),
      );

      await donationRepo.save(
        donationRepo.create({
          amount,
          message: 'Proud to support this cause!',
          donorId: donor.id,
          campaignId: campaign.id,
          status: DonationStatus.COMPLETED,
          transactionId: `SEED-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        }),
      );
    }
  }

  console.log('Dummy data seed complete.');
}

async function main() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DATABASE_PATH || 'fundrise.db',
    entities: [User, Campaign, Donation],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await seedDatabase(dataSource, 'create');
    console.log('Dummy database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize dummy database:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main().catch((error) => {
  console.error('Unexpected dummy initializer failure:', error);
  process.exit(1);
});
