import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column({ length: 20 })
  tipe: string; // 'masuk' | 'keluar' | 'penyesuaian' | 'rusak' | 'retur'

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  qty: number;

  @Column({ length: 20, nullable: true })
  satuan: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  stok_sebelum: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  stok_sesudah: number;

  @Column({ nullable: true })
  referensi_id: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}