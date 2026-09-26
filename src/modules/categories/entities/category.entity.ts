import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama: string;

  @Column({ length: 10 })
  tipe: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ default: 0 })
  urutan: number;

  @Column({ default: 1 })
  is_active: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}