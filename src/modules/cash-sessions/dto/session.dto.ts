import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenSessionDto {
  @ApiProperty({ example: 200000 })
  @IsNumber()
  saldo_awal: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class CloseSessionDto {
  @ApiProperty({ example: 1500000 })
  @IsNumber()
  saldo_akhir_aktual: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatan?: string;
}