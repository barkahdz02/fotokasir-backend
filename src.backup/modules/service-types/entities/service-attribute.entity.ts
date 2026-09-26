import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service_attributes')
export class ServiceAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  dimensi: string;

  @Column({ length: 50 })
  nilai: string;

  @Column({ length: 100 })
  label: string;

  @Column({ default: 0 })
  urutan: number;

  @Column({ default: 1 })
  is_active: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}