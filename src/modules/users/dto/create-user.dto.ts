import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Rian' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 'rian' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'rian@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '081234567890', required: false })
  @IsOptional()
  @IsString()
  no_hp?: string;

  @ApiProperty({ example: ['kasir'], description: 'Daftar kode role' })
  @IsArray()
  roles: string[];
}