import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionItem } from '../transactions/entities/transaction-item.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../inventory/entities/stock-movement.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(TransactionItem) private itemRepo: Repository<TransactionItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(StockMovement) private moveRepo: Repository<StockMovement>,
  ) {}

  private getDateRange(periode: string) {
    const now = new Date();
    let start: Date;
    const end = new Date();

    if (periode === 'hari') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (periode === 'minggu') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
    } else if (periode === 'bulan') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }

    return { start, end };
  }

  async getPenjualan(periode: string = 'hari') {
    const { start, end } = this.getDateRange(periode);

    const transactions = await this.txRepo.find({
      where: {
        created_at: Between(start, end),
        status: 'selesai',
      },
      order: { created_at: 'DESC' },
    });

    const total = transactions.reduce((s, t) => s + Number(t.total), 0);
    const totalTunai = transactions
      .filter((t) => t.metode_bayar === 'tunai')
      .reduce((s, t) => s + Number(t.total), 0);
    const totalQris = transactions
      .filter((t) => t.metode_bayar === 'qris')
      .reduce((s, t) => s + Number(t.total), 0);
    const totalTransfer = transactions
      .filter((t) => t.metode_bayar === 'transfer')
      .reduce((s, t) => s + Number(t.total), 0);

    return {
      periode,
      dari: start,
      sampai: end,
      ringkasan: {
        total_transaksi: transactions.length,
        total_omset: total,
        rata_rata: transactions.length > 0 ? total / transactions.length : 0,
        total_tunai: totalTunai,
        total_qris: totalQris,
        total_transfer: totalTransfer,
      },
      transaksi: transactions,
    };
  }

  async getLabaRugi(periode: string = 'bulan') {
    const { start, end } = this.getDateRange(periode);

    // Ambil semua transaction items
    const txIds = await this.txRepo
      .createQueryBuilder('t')
      .where('t.created_at BETWEEN :start AND :end', { start, end })
      .andWhere('t.status = :s', { s: 'selesai' })
      .select('t.id')
      .getRawMany();

    const ids = txIds.map((t) => t.t_id);
    if (ids.length === 0) {
      return {
        periode,
        omset: 0,
        cogs: 0,
        laba_kotor: 0,
        margin: 0,
      };
    }

    const items = await this.itemRepo
      .createQueryBuilder('ti')
      .where('ti.transaction_id IN (:...ids)', { ids })
      .getMany();

    const omset = items.reduce((s, i) => s + Number(i.subtotal), 0);

    // Hitung COGS untuk produk fisik
    let cogs = 0;
    for (const item of items) {
      if (item.tipe === 'produk' && item.product_id) {
        const product = await this.productRepo.findOne({ where: { id: item.product_id } });
        if (product) {
          cogs += Number(product.harga_beli) * Number(item.qty_dasar);
        }
      } else {
        // Untuk jasa, asumsi COGS 40%
        cogs += Number(item.subtotal) * 0.4;
      }
    }

    const labaKotor = omset - cogs;
    const margin = omset > 0 ? (labaKotor / omset) * 100 : 0;

    return {
      periode,
      dari: start,
      sampai: end,
      omset,
      cogs,
      laba_kotor: labaKotor,
      margin: Math.round(margin * 100) / 100,
    };
  }

  async getTopProducts(periode: string = 'bulan', limit: number = 10) {
    const { start, end } = this.getDateRange(periode);

    const txIds = await this.txRepo
      .createQueryBuilder('t')
      .where('t.created_at BETWEEN :start AND :end', { start, end })
      .andWhere('t.status = :s', { s: 'selesai' })
      .select('t.id')
      .getRawMany();

    if (txIds.length === 0) return [];
    const ids = txIds.map((t) => t.t_id);

    const items = await this.itemRepo
      .createQueryBuilder('ti')
      .where('ti.transaction_id IN (:...ids)', { ids })
      .getMany();

    // Group by nama_snapshot
    const grouped: Record<string, { nama: string; tipe: string; total_qty: number; total_omset: number }> = {};

    for (const item of items) {
      const key = item.nama_snapshot;
      if (!grouped[key]) {
        grouped[key] = { nama: item.nama_snapshot, tipe: item.tipe, total_qty: 0, total_omset: 0 };
      }
      grouped[key].total_qty += Number(item.qty);
      grouped[key].total_omset += Number(item.subtotal);
    }

    return Object.values(grouped)
      .sort((a, b) => b.total_omset - a.total_omset)
      .slice(0, limit);
  }

  async getStok() {
    const products = await this.productRepo.find({
      where: { is_active: 1, tipe: 'produk' },
      order: { stok_qty: 'ASC' },
    });

    const totalNilaiStok = products.reduce(
      (s, p) => s + Number(p.stok_qty) * Number(p.harga_beli || 0),
      0,
    );

    const lowStock = products.filter((p) => Number(p.stok_qty) <= Number(p.stok_minimum));

    return {
      total_produk: products.length,
      total_nilai_stok: totalNilaiStok,
      produk_stok_rendah: lowStock.length,
      list_stok_rendah: lowStock,
      semua_produk: products.map((p) => ({
        id: p.id,
        sku: p.sku,
        nama: p.nama,
        stok_qty: p.stok_qty,
        stok_minimum: p.stok_minimum,
        harga_beli: p.harga_beli,
        nilai_stok: Number(p.stok_qty) * Number(p.harga_beli || 0),
      })),
    };
  }

  async getDashboard() {
    const hariIni = await this.getPenjualan('hari');
    const bulanIni = await this.getPenjualan('bulan');
    const labaBulanIni = await this.getLabaRugi('bulan');
    const stok = await this.getStok();
    const topProducts = await this.getTopProducts('bulan', 5);

    return {
      hari_ini: hariIni.ringkasan,
      bulan_ini: bulanIni.ringkasan,
      laba_bulan_ini: {
        omset: labaBulanIni.omset,
        laba_kotor: labaBulanIni.laba_kotor,
        margin: labaBulanIni.margin,
      },
      stok: {
        total_produk: stok.total_produk,
        produk_stok_rendah: stok.produk_stok_rendah,
        total_nilai_stok: stok.total_nilai_stok,
      },
      top_produk: topProducts,
    };
  }
}