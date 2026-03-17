import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Campaign } from '../campaigns/campaign.entity';

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text', default: DonationStatus.PENDING })
  status: DonationStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true, type: 'text' })
  message: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'donorId' })
  donor: User;

  @Column()
  donorId: string;

  @ManyToOne(() => Campaign, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column()
  campaignId: string;

  @CreateDateColumn()
  createdAt: Date;
}
