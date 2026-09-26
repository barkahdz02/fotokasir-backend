import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transaction_items')
export class TransactionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transaction_id: number;

  @Column({ nullable: true })
  product_id: number;

  @Column({ length: 10 })
  tipe: string;

  @Column({ length: 200 })
  nama_snapshot: string;

  @Column({ length: 50, nullable: true })
  sku_snapshot: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  qty: number;

  @Column({ length: 20 })
  satuan: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  qty_dasar: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  harga_satuan: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  diskon_item: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  subtotal: number;

  @Column({ type: 'text', default: '{}' })
  detail_jasa: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}