import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('role_switch_logs')
export class RoleSwitchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 30, nullable: true })
  dari_role: string;

  @Column({ length: 30 })
  ke_role: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  waktu: Date;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;
}