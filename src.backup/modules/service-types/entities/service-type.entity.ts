import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama: string;

  @Column({ nullable: true })
  category_id: number;

  @Column({ length: 20, default: 'lembar' })
  satuan: string;

  @Column({ type: 'text', default: '[]' })
  dimensi: string;

  @Column({ length: 30, default: 'per_unit' })
  formula_harga: string;

  @Column({ default: 1 })
  is_active: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}