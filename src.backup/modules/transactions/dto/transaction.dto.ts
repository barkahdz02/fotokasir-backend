import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsIn, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  product_id?: number;

  @ApiProperty({ example: 'produk', enum: ['produk', 'jasa'] })
  @IsIn(['produk', 'jasa'])
  tipe: string;

  @ApiProperty({ example: 'Kertas A4 70gr' })
  @IsString()
  nama_snapshot: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sku_snapshot?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 'lembar' })
  @IsString()
  satuan: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  qty_dasar?: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  harga_satuan: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  diskon_item?: number;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  detail_jasa?: Record<string, any>;
}

export class CreateTransactionDto {
  @ApiProperty({ type: [TransactionItemDto] })
  @IsArray()
  items: TransactionItemDto[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  diskon_total: number;

  @ApiProperty({ example: 'tunai', enum: ['tunai', 'qris', 'transfer'] })
  @IsIn(['tunai', 'qris', 'transfer'])
  metode_bayar: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  bayar: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pelanggan_nama?: string;
}