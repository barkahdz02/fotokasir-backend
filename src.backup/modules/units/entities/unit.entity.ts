import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  nama: string;

  @Column({ length: 10, nullable: true })
  singkatan: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}