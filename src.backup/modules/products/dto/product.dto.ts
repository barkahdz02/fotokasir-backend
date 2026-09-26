import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'KRT-A4-70' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Kertas A4 70gr' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 'produk', enum: ['produk', 'jasa'] })
  @IsIn(['produk', 'jasa'])
  tipe: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  satuan_dasar_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stok_qty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stok_minimum?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  harga_beli?: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  harga_jual: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  barcode?: string;
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stok_qty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stok_minimum?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  harga_beli?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  harga_jual?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  is_active?: boolean;
}