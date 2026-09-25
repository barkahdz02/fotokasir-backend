import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'lembar' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 'lbr', required: false })
  @IsOptional()
  @IsString()
  singkatan?: string;
}