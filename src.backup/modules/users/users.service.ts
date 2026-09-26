import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async findAll() {
    const users = await this.userRepo.find({
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      users.map(async (u) => {
        const roles = await this.getUserRoles(u.id);
        return {
          id: u.id,
          nama: u.nama,
          username: u.username,
          email: u.email,
          no_hp: u.no_hp,
          is_active: u.is_active === 1,
          is_super_admin: u.is_super_admin === 1,
          roles,
          created_at: u.created_at,
        };
      }),
    );
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const roles = await this.getUserRoles(id);
    return {
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      no_hp: user.no_hp,
      is_active: user.is_active === 1,
      is_super_admin: user.is_super_admin === 1,
      roles,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existing) throw new BadRequestException('Username sudah dipakai');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      nama: dto.nama,
      username: dto.username,
      email: dto.email,
      no_hp: dto.no_hp,
      password_hash: hash,
      is_active: 1,
      is_super_admin: 0,
    });
    const saved = await this.userRepo.save(user);

    if (dto.roles && dto.roles.length > 0) {
      await this.assignRoles(saved.id, dto.roles);
    }

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (dto.nama) user.nama = dto.nama;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.no_hp !== undefined) user.no_hp = dto.no_hp;
    if (dto.is_active !== undefined) user.is_active = dto.is_active ? 1 : 0;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);

    user.updated_at = new Date();
    await this.userRepo.save(user);

    if (dto.roles) {
      await this.assignRoles(id, dto.roles);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.is_super_admin === 1) throw new BadRequestException('Super admin tidak bisa dihapus');

    user.is_active = 0;
    await this.userRepo.save(user);
    return { message: 'User dinonaktifkan' };
  }

  async assignRoles(userId: number, roleKodes: string[]) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const roles = await this.roleRepo.find({
      where: { kode: In(roleKodes), is_active: 1 },
    });

    if (roles.length !== roleKodes.length) {
      throw new BadRequestException('Ada role yang tidak valid');
    }

    // Hapus semua role lama
    await this.userRoleRepo.delete({ user_id: userId });

    // Tambah role baru
    for (const role of roles) {
      await this.userRoleRepo.save({
        user_id: userId,
        role_id: role.id,
        is_active: 1,
      });
    }

    return this.getUserRoles(userId);
  }

  async getUserRoles(userId: number) {
    const userRoles = await this.userRoleRepo.find({
      where: { user_id: userId, is_active: 1 },
      relations: { role: true },
    });
    return userRoles
      .filter((ur) => ur.role && ur.role.is_active === 1)
      .map((ur) => ({
        id: ur.role.id,
        kode: ur.role.kode,
        nama: ur.role.nama,
        warna: ur.role.warna,
      }));
  }
}