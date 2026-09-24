import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchRoleDto {
  @ApiProperty({ example: 'kasir' })
  @IsString()
  @IsNotEmpty()
  role: string;
}