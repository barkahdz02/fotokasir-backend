import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Kertas' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 'produk', enum: ['produk', 'jasa'] })
  @IsIn(['produk', 'jasa'])
  tipe: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  urutan?: number;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  urutan?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  is_active?: boolean;
}