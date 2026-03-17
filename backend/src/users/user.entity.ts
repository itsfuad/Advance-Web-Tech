import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'text', default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'text', default: UserStatus.ACTIVE })
  status: UserStatus;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  otpCode: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'datetime' })
  otpExpiry: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
