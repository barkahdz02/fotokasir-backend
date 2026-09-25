import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockInDto, StockAdjustDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Post('stock-in')
  @ApiOperation({ summary: 'Stok masuk (pembelian)' })
  stockIn(@CurrentUser() user: any, @Body() dto: StockInDto) {
    return this.service.stockIn(user.id, dto);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Penyesuaian stok (rusak/hilang/opname)' })
  stockAdjust(@CurrentUser() user: any, @Body() dto: StockAdjustDto) {
    return this.service.stockAdjust(user.id, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Riwayat pergerakan stok' })
  @ApiQuery({ name: 'product_id', required: false })
  findAllMovements(@Query('product_id') productId?: string) {
    return this.service.findAllMovements(productId ? parseInt(productId) : undefined);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'List pembelian' })
  findAllPurchases() {
    return this.service.findAllPurchases();
  }

  @Get('purchases/:id')
  @ApiOperation({ summary: 'Detail pembelian' })
  findPurchaseDetail(@Param('id', ParseIntPipe) id: number) {
    return this.service.findPurchaseDetail(id);
  }
}