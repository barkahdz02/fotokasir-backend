import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'default-secret';
    console.log('🔑 JwtStrategy JWT secret:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    this.logger.debug('JWT Payload: ' + JSON.stringify(payload));

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.is_active !== 1) {
      this.logger.error('User not found or inactive: ' + payload.sub);
      throw new UnauthorizedException('User tidak valid');
    }

    return {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role_aktif: payload.role_aktif,
      is_super_admin: payload.is_super_admin,
    };
  }
}