import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 30 })
  role_aktif: string;

  @Column({ unique: true, length: 100, nullable: true })
  token_jti: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  login_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  logout_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  device_info: string;

  @Column({ default: 1 })
  is_active: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}