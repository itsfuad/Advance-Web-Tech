import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CampaignStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', default: 0 })
  goalAmount: number;

  @Column({ type: 'float', default: 0 })
  raisedAmount: number;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'text', default: CampaignStatus.ACTIVE })
  status: CampaignStatus;

  @Column({ nullable: true, type: 'datetime' })
  deadline: Date;

  @Column({ nullable: true })
  category: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @Column({ default: false })
  reported: boolean;

  @Column({ nullable: true, type: 'text' })
  reportReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
