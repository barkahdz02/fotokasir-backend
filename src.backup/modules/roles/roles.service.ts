import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
    @InjectRepository(RolePermission) private rpRepo: Repository<RolePermission>,
  ) {}

  async findAllRoles() {
    const roles = await this.roleRepo.find({ order: { urutan: 'ASC' } });
    return Promise.all(
      roles.map(async (r) => {
        const perms = await this.getRolePermissions(r.id);
        return {
          id: r.id,
          kode: r.kode,
          nama: r.nama,
          deskripsi: r.deskripsi,
          warna: r.warna,
          urutan: r.urutan,
          is_active: r.is_active === 1,
          total_permissions: perms.length,
          permissions: perms,
        };
      }),
    );
  }

  async findOneRole(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    const permissions = await this.getRolePermissions(id);
    return {
      id: role.id,
      kode: role.kode,
      nama: role.nama,
      deskripsi: role.deskripsi,
      warna: role.warna,
      urutan: role.urutan,
      is_active: role.is_active === 1,
      permissions,
    };
  }

  async createRole(data: { kode: string; nama: string; deskripsi?: string; warna?: string; urutan?: number }) {
    const existing = await this.roleRepo.findOne({ where: { kode: data.kode } });
    if (existing) throw new BadRequestException('Kode role sudah dipakai');

    const role = this.roleRepo.create({
      kode: data.kode,
      nama: data.nama,
      deskripsi: data.deskripsi,
      warna: data.warna,
      urutan: data.urutan || 0,
      is_active: 1,
    });
    return this.roleRepo.save(role);
  }

  async updateRole(id: number, data: Partial<{ nama: string; deskripsi: string; warna: string; urutan: number; is_active: boolean }>) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');

    if (data.nama) role.nama = data.nama;
    if (data.deskripsi !== undefined) role.deskripsi = data.deskripsi;
    if (data.warna) role.warna = data.warna;
    if (data.urutan !== undefined) role.urutan = data.urutan;
    if (data.is_active !== undefined) role.is_active = data.is_active ? 1 : 0;

    await this.roleRepo.save(role);
    return this.findOneRole(id);
  }

  async deleteRole(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    if (['admin', 'kasir', 'operator', 'gudang'].includes(role.kode)) {
      throw new BadRequestException('Role bawaan tidak bisa dihapus');
    }
    role.is_active = 0;
    await this.roleRepo.save(role);
    return { message: 'Role dinonaktifkan' };
  }

  async findAllPermissions() {
    return this.permRepo.find({ order: { modul: 'ASC', kode: 'ASC' } });
  }

  async getRolePermissions(roleId: number) {
    const rps = await this.rpRepo.find({
      where: { role_id: roleId },
      relations: { permission: true },
    });
    return rps.map((rp) => ({
      id: rp.permission?.id,
      kode: rp.permission?.kode,
      nama: rp.permission?.nama,
      modul: rp.permission?.modul,
    }));
  }

  async setRolePermissions(roleId: number, permKodes: string[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');

    const perms = await this.permRepo.find({ where: { kode: In(permKodes) } });
    if (perms.length !== permKodes.length) {
      throw new BadRequestException('Ada permission yang tidak valid');
    }

    await this.rpRepo.delete({ role_id: roleId });
    for (const p of perms) {
      await this.rpRepo.save({ role_id: roleId, permission_id: p.id });
    }
    return this.getRolePermissions(roleId);
  }
}