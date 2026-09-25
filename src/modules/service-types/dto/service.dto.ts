import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceTypeDto {
  @ApiProperty({ example: 'Fotocopy' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiProperty({ example: 'lembar' })
  @IsString()
  satuan: string;

  @ApiProperty({ example: ['ukuran', 'warna', 'sisi'] })
  @IsArray()
  dimensi: string[];

  @ApiProperty({ example: 'per_unit', required: false })
  @IsOptional()
  @IsString()
  formula_harga?: string;
}

export class CreateServicePriceDto {
  @ApiProperty({ example: { ukuran: 'A4', warna: 'hitam_putih', sisi: '1_sisi' } })
  @IsObject()
  kombinasi: Record<string, string>;

  @ApiProperty({ example: 200 })
  @IsNumber()
  harga: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_qty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_qty?: number;
}

export class CreateAttributeDto {
  @ApiProperty({ example: 'ukuran' })
  @IsString()
  dimensi: string;

  @ApiProperty({ example: 'A4' })
  @IsString()
  nilai: string;

  @ApiProperty({ example: 'A4' })
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  urutan?: number;
}