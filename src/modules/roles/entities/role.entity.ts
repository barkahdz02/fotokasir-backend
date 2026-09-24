import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  kode: string;

  @Column({ length: 50 })
  nama: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ length: 7, nullable: true })
  warna: string;

  @Column({ default: 0 })
  urutan: number;

  @Column({ default: 1 })
  is_active: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => UserRole, (ur) => ur.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];
}