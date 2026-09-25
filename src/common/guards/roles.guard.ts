import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('User tidak terautentikasi');

    if (user.is_super_admin) return true;

    if (!requiredRoles.includes(user.role_aktif)) {
      throw new ForbiddenException(
        `Akses ditolak. Role yang dibutuhkan: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}