import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    if (user.is_active !== 1) {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Ambil daftar role user
    const userRoles = await this.userRoleRepo.find({
      where: { user_id: user.id, is_active: 1 },
      relations: { role: true },
    });

    const roles = userRoles
      .filter((ur) => ur.role && ur.role.is_active === 1)
      .map((ur) => ({
        kode: ur.role.kode,
        nama: ur.role.nama,
      }));

    // Update last_login
    user.last_login_at = new Date();
    await this.userRepo.save(user);

    // Jika super admin atau hanya 1 role, langsung kasih token
    if (user.is_super_admin === 1) {
      const token = this.generateToken(user, 'admin');
      return {
        user: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          is_super_admin: true,
          roles,
        },
        require_role_selection: false,
        token,
        role_aktif: 'admin',
      };
    }

    if (roles.length === 0) {
      throw new UnauthorizedException('User tidak memiliki role aktif');
    }

    if (roles.length === 1) {
      const token = this.generateToken(user, roles[0].kode);
      return {
        user: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          is_super_admin: false,
          roles,
        },
        require_role_selection: false,
        token,
        role_aktif: roles[0].kode,
      };
    }

    // Multi-role: minta user pilih role
    const tempToken = this.jwtService.sign(
      { sub: user.id, type: 'temp' },
      { expiresIn: '5m' },
    );

    return {
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        is_super_admin: false,
        roles,
      },
      require_role_selection: true,
      token_temp: tempToken,
    };
  }

  async switchRole(userId: number, dto: SwitchRoleDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const role = await this.roleRepo.findOne({
      where: { kode: dto.role, is_active: 1 },
    });
    if (!role) throw new BadRequestException('Role tidak valid');

    // Cek user punya role ini (kecuali super admin)
    if (user.is_super_admin !== 1) {
      const userRole = await this.userRoleRepo.findOne({
        where: { user_id: userId, role_id: role.id, is_active: 1 },
      });
      if (!userRole) throw new UnauthorizedException('Anda tidak punya role ini');
    }

    const token = this.generateToken(user, role.kode);
    return {
      token,
      role_aktif: role.kode,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        is_super_admin: user.is_super_admin === 1,
      },
    };
  }

  async me(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const userRoles = await this.userRoleRepo.find({
      where: { user_id: userId, is_active: 1 },
      relations: { role: true },
    });

    return {
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      is_super_admin: user.is_super_admin === 1,
      roles: userRoles
        .filter((ur) => ur.role && ur.role.is_active === 1)
        .map((ur) => ({ kode: ur.role.kode, nama: ur.role.nama })),
    };
  }

  private generateToken(user: User, roleAktif: string): string {
    return this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role_aktif: roleAktif,
      is_super_admin: user.is_super_admin === 1,
    });
  }
}