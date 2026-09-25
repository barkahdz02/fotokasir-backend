import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, nullable: true })
  sku: string;

  @Column({ length: 50, nullable: true })
  barcode: string;

  @Column({ length: 200 })
  nama: string;

  @Column()
  category_id: number;

  @Column({ length: 10 })
  tipe: string;

  @Column({ nullable: true })
  satuan_dasar_id: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  stok_qty: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  stok_minimum: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  harga_beli: number;

  @Column({ length: 30, nullable: true })
  satuan_jasa: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  harga_jual: number;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'text', default: '{}' })
  metadata: string;

  @Column({ default: 1 })
  is_active: number;

  @Column({ nullable: true })
  created_by: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}