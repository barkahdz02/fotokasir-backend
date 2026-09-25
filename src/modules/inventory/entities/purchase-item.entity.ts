import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchase_id: number;

  @Column()
  product_id: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  qty: number;

  @Column({ length: 20, nullable: true })
  satuan: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  qty_dasar: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  harga_beli: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  subtotal: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}