import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashSession } from './entities/cash-session.entity';
import { OpenSessionDto, CloseSessionDto } from './dto/session.dto';

@Injectable()
export class CashSessionsService {
  constructor(
    @InjectRepository(CashSession) private repo: Repository<CashSession>,
  ) {}

  async findActive(kasirId: number) {
    return this.repo.findOne({
      where: { kasir_id: kasirId, status: 'buka' },
    });
  }

  async findAll() {
    return this.repo.find({ order: { waktu_buka: 'DESC' }, take: 50 });
  }

  async open(kasirId: number, dto: OpenSessionDto) {
    const existing = await this.findActive(kasirId);
    if (existing) throw new BadRequestException('Anda masih punya sesi kas yang terbuka');

    const session = this.repo.create({
      kasir_id: kasirId,
      saldo_awal: dto.saldo_awal,
      catatan: dto.catatan,
      status: 'buka',
    });
    return this.repo.save(session);
  }

  async close(kasirId: number, dto: CloseSessionDto) {
    const session = await this.findActive(kasirId);
    if (!session) throw new NotFoundException('Tidak ada sesi kas yang terbuka');

    const totalSistem = Number(session.saldo_awal) +
      Number(session.total_penjualan) +
      Number(session.total_qris) +
      Number(session.total_transfer);

    session.waktu_tutup = new Date();
    session.saldo_akhir_sistem = totalSistem;
    session.saldo_akhir_aktual = dto.saldo_akhir_aktual;
    session.selisih = dto.saldo_akhir_aktual - totalSistem;
    session.catatan = dto.catatan || session.catatan;
    session.status = 'tutup';

    return this.repo.save(session);
  }

  async updateTotals(sessionId: number, metode: string, amount: number) {
    const session = await this.repo.findOne({ where: { id: sessionId } });
    if (!session) return;

    if (metode === 'tunai') {
      session.total_penjualan = Number(session.total_penjualan) + amount;
    } else if (metode === 'qris') {
      session.total_qris = Number(session.total_qris) + amount;
    } else if (metode === 'transfer') {
      session.total_transfer = Number(session.total_transfer) + amount;
    }
    await this.repo.save(session);
  }
}