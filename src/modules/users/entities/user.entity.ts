import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../../roles/entities/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100, nullable: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 20, nullable: true })
  no_hp: string;

  @Column({ default: 1 })
  is_active: number;

  @Column({ default: 0 })
  is_super_admin: number;

  @Column({ length: 30, nullable: true })
  default_role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];
}