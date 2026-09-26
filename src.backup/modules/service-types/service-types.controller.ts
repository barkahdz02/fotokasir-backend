import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto, CreateServicePriceDto, CreateAttributeDto } from './dto/service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Service Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ServiceTypesController {
  constructor(private service: ServiceTypesService) {}

  @Get('service-types')
  @ApiOperation({ summary: 'List jenis jasa' })
  findAllTypes() {
    return this.service.findAllTypes();
  }

  @Get('service-types/:id')
  findOneType(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneType(id);
  }

  @Post('service-types')
  createType(@Body() dto: CreateServiceTypeDto) {
    return this.service.createType(dto);
  }

  @Put('service-types/:id')
  updateType(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateServiceTypeDto>) {
    return this.service.updateType(id, dto);
  }

  @Delete('service-types/:id')
  deleteType(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteType(id);
  }

  @Get('service-attributes')
  @ApiOperation({ summary: 'List atribut jasa' })
  findAllAttributes(@Query('dimensi') dimensi?: string) {
    return this.service.findAllAttributes(dimensi);
  }

  @Post('service-attributes')
  createAttribute(@Body() dto: CreateAttributeDto) {
    return this.service.createAttribute(dto);
  }

  @Delete('service-attributes/:id')
  deleteAttribute(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttribute(id);
  }

  @Get('service-types/:id/prices')
  @ApiOperation({ summary: 'Harga jasa' })
  findPrices(@Param('id', ParseIntPipe) id: number) {
    return this.service.findPrices(id);
  }

  @Post('service-types/:id/prices')
  @ApiOperation({ summary: 'Tambah harga jasa' })
  createPrice(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateServicePriceDto) {
    return this.service.createPrice(id, dto);
  }

  @Delete('service-prices/:id')
  deletePrice(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePrice(id);
  }

  @Post('service-types/:id/lookup')
  @ApiOperation({ summary: 'Cari harga berdasarkan kombinasi' })
  lookupPrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { kombinasi: Record<string, string>; qty?: number },
  ) {
    return this.service.lookupPrice(id, body.kombinasi, body.qty || 1);
  }
}