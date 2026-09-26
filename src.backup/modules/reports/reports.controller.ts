import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Ringkasan dashboard' })
  dashboard() {
    return this.service.getDashboard();
  }

  @Get('penjualan')
  @ApiOperation({ summary: 'Laporan penjualan' })
  @ApiQuery({ name: 'periode', required: false, enum: ['hari', 'minggu', 'bulan', 'tahun'] })
  penjualan(@Query('periode') periode = 'hari') {
    return this.service.getPenjualan(periode);
  }

  @Get('laba-rugi')
  @ApiOperation({ summary: 'Laporan laba rugi' })
  @ApiQuery({ name: 'periode', required: false, enum: ['hari', 'minggu', 'bulan', 'tahun'] })
  labaRugi(@Query('periode') periode = 'bulan') {
    return this.service.getLabaRugi(periode);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Produk/jasa terlaris' })
  @ApiQuery({ name: 'periode', required: false })
  @ApiQuery({ name: 'limit', required: false })
  topProducts(@Query('periode') periode = 'bulan', @Query('limit') limit = '10') {
    return this.service.getTopProducts(periode, parseInt(limit));
  }

  @Get('stok')
  @ApiOperation({ summary: 'Laporan stok' })
  stok() {
    return this.service.getStok();
  }
}