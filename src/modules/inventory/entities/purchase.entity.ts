import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  purchase_no: string;

  @Column({ nullable: true })
  supplier_id: number;

  @Column({ length: 150, nullable: true })
  supplier_nama: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  tanggal: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total: number;

  @Column({ length: 20, default: 'diterima' })
  status: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}