import { IsNumber, IsOptional, IsString, IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StockInItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 'rim' })
  @IsString()
  satuan: string;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  harga_beli: number;
}

export class StockInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier_nama?: string;

  @ApiProperty({ type: [StockInItemDto] })
  @IsArray()
  items: StockInItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class StockAdjustDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 'penyesuaian', enum: ['penyesuaian', 'rusak', 'hilang', 'retur'] })
  @IsIn(['penyesuaian', 'rusak', 'hilang', 'retur'])
  tipe: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 'lembar' })
  @IsString()
  satuan: string;

  @ApiProperty({ example: 'Kertas sobek saat proses cetak' })
  @IsString()
  keterangan: string;
}