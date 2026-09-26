import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service_prices')
export class ServicePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  service_type_id: number;

  @Column({ type: 'text' })
  kombinasi: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  harga: number;

  @Column({ default: 1 })
  min_qty: number;

  @Column({ nullable: true })
  max_qty: number;

  @Column({ default: 1 })
  is_active: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}