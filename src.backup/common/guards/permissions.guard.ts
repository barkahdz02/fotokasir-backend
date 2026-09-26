import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/roles/entities/role-permission.entity';
import { Permission } from '../../modules/roles/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private rpRepo: Repository<RolePermission>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPerms || requiredPerms.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('User tidak terautentikasi');

    if (user.is_super_admin) return true;

    // Ambil permission dari role aktif
    const role = await this.roleRepo.findOne({ where: { kode: user.role_aktif } });
    if (!role) throw new ForbiddenException('Role tidak valid');

    const rolePerms = await this.rpRepo.find({
      where: { role_id: role.id },
      relations: { permission: true },
    });

    const permKodes = rolePerms.map((rp) => rp.permission?.kode).filter(Boolean);

    const hasAll = requiredPerms.every((p) => permKodes.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Akses ditolak. Permission dibutuhkan: ${requiredPerms.join(', ')}`,
      );
    }
    return true;
  }
}