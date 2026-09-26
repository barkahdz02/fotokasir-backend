import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashSessionsService } from './cash-sessions.service';
import { OpenSessionDto, CloseSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Cash Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-sessions')
export class CashSessionsController {
  constructor(private service: CashSessionsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Sesi kas aktif' })
  findActive(@CurrentUser() user: any) {
    return this.service.findActive(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Riwayat sesi kas' })
  findAll() {
    return this.service.findAll();
  }

  @Post('open')
  @ApiOperation({ summary: 'Buka sesi kas' })
  open(@CurrentUser() user: any, @Body() dto: OpenSessionDto) {
    return this.service.open(user.id, dto);
  }

  @Post('close')
  @ApiOperation({ summary: 'Tutup sesi kas' })
  close(@CurrentUser() user: any, @Body() dto: CloseSessionDto) {
    return this.service.close(user.id, dto);
  }
}