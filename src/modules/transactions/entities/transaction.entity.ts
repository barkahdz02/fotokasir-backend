import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  invoice_no: string;

  @Column()
  kasir_id: number;

  @Column({ nullable: true })
  session_id: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  diskon_total: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  total: number;

  @Column({ length: 20 })
  metode_bayar: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  bayar: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  kembalian: number;

  @Column({ length: 20, default: 'selesai' })
  status: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ length: 100, nullable: true })
  pelanggan_nama: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}