import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { Product } from '../products/entities/product.entity';
import { CashSession } from '../cash-sessions/entities/cash-session.entity';
import { CreateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(TransactionItem) private itemRepo: Repository<TransactionItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(CashSession) private sessionRepo: Repository<CashSession>,
  ) {}

  private async generateInvoice(): Promise<string> {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await this.txRepo.count();
    return `INV-${ymd}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(kasirId: number, dto: CreateTransactionDto) {
    // Cek sesi kas aktif
    const session = await this.sessionRepo.findOne({
      where: { kasir_id: kasirId, status: 'buka' },
    });
    if (!session) throw new BadRequestException('Buka sesi kas dulu sebelum transaksi');

    // Hitung subtotal & total
    const subtotal = dto.items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    const total = subtotal - Number(dto.diskon_total || 0);

    if (Number(dto.bayar) < total) {
      throw new BadRequestException(`Uang bayar kurang. Total: ${total}, Bayar: ${dto.bayar}`);
    }

    const kembalian = Number(dto.bayar) - total;
    const invoice_no = await this.generateInvoice();

    // Simpan transaksi
    const tx = this.txRepo.create({
      invoice_no,
      kasir_id: kasirId,
      session_id: session.id,
      subtotal,
      diskon_total: dto.diskon_total || 0,
      total,
      metode_bayar: dto.metode_bayar,
      bayar: dto.bayar,
      kembalian,
      status: 'selesai',
      catatan: dto.catatan,
      pelanggan_nama: dto.pelanggan_nama,
    });
    const saved = await this.txRepo.save(tx);

    // Simpan items & kurangi stok
    for (const item of dto.items) {
      const qtyDasar = item.qty_dasar || item.qty;

      await this.itemRepo.save({
        transaction_id: saved.id,
        product_id: item.product_id,
        tipe: item.tipe,
        nama_snapshot: item.nama_snapshot,
        sku_snapshot: item.sku_snapshot,
        qty: item.qty,
        satuan: item.satuan,
        qty_dasar: qtyDasar,
        harga_satuan: item.harga_satuan,
        diskon_item: item.diskon_item || 0,
        subtotal: item.subtotal,
        detail_jasa: JSON.stringify(item.detail_jasa || {}),
      });

      // Kurangi stok untuk produk fisik
      if (item.tipe === 'produk' && item.product_id) {
        const product = await this.productRepo.findOne({ where: { id: item.product_id } });
        if (product) {
          if (Number(product.stok_qty) < qtyDasar) {
            throw new BadRequestException(`Stok ${product.nama} tidak cukup`);
          }
          product.stok_qty = Number(product.stok_qty) - qtyDasar;
          await this.productRepo.save(product);
        }
      }
    }

    // Update sesi kas
    if (dto.metode_bayar === 'tunai') {
      session.total_penjualan = Number(session.total_penjualan) + total;
    } else if (dto.metode_bayar === 'qris') {
      session.total_qris = Number(session.total_qris) + total;
    } else if (dto.metode_bayar === 'transfer') {
      session.total_transfer = Number(session.total_transfer) + total;
    }
    await this.sessionRepo.save(session);

    return this.findOne(saved.id);
  }

  async findAll(limit = 50) {
    return this.txRepo.find({ order: { created_at: 'DESC' }, take: limit });
  }

  async findOne(id: number) {
    const tx = await this.txRepo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');

    const items = await this.itemRepo.find({ where: { transaction_id: id } });
    return {
      ...tx,
      items: items.map((i) => ({
        ...i,
        detail_jasa: JSON.parse(i.detail_jasa || '{}'),
      })),
    };
  }
}