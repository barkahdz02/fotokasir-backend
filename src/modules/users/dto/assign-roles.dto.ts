import { IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ example: ['kasir', 'gudang'] })
  @IsArray()
  @ArrayNotEmpty()
  roles: string[];
}