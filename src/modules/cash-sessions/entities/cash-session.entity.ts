import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cash_sessions')
export class CashSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kasir_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  waktu_buka: Date;

  @Column({ type: 'datetime', nullable: true })
  waktu_tutup: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  saldo_awal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_penjualan: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_qris: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_transfer: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  saldo_akhir_sistem: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  saldo_akhir_aktual: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  selisih: number;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ length: 20, default: 'buka' })
  status: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}