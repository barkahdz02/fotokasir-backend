import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { StockInDto, StockAdjustDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(StockMovement) private moveRepo: Repository<StockMovement>,
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem) private purchaseItemRepo: Repository<PurchaseItem>,
  ) {}

  private async generatePurchaseNo(): Promise<string> {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await this.purchaseRepo.count();
    return `PO-${ymd}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Konversi qty dari satuan input ke satuan dasar (lembar, pcs, dst).
   * Return faktor konversi: 1 rim = 500, 1 lusin = 12, selain itu = 1
   */
  private getKonversiFaktor(satuan: string): number {
    if (satuan === 'rim') return 500;
    if (satuan === 'lusin') return 12;
    return 1;
  }

  async stockIn(userId: number, dto: StockInDto) {
    const purchase_no = await this.generatePurchaseNo();
    let total = 0;

    // Hitung total & konversi qty dulu
    const itemsWithDasar = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.productRepo.findOne({ where: { id: item.product_id } });
        if (!product) throw new NotFoundException(`Produk ID ${item.product_id} tidak ditemukan`);

        const faktor = this.getKonversiFaktor(item.satuan);
        const qtyDasar = item.qty * faktor;

        // Harga beli per satuan dasar (mis. per lembar)
        // Contoh: beli 5 rim @ 45.000 → 45.000 / 500 = 90 per lembar
        const hargaBeliPerDasar = item.harga_beli / faktor;

        const subtotal = item.qty * item.harga_beli;
        total += subtotal;

        return { ...item, product, qtyDasar, hargaBeliPerDasar, subtotal };
      }),
    );

    // Buat purchase
    const purchase = await this.purchaseRepo.save({
      purchase_no,
      supplier_nama: dto.supplier_nama,
      total,
      status: 'diterima',
      catatan: dto.catatan,
      user_id: userId,
    });

    // Simpan items & update stok
    for (const item of itemsWithDasar) {
      // purchase_items simpan harga_beli ORIGINAL (per rim) — sebagai historical
      await this.purchaseItemRepo.save({
        purchase_id: purchase.id,
        product_id: item.product_id,
        qty: item.qty,
        satuan: item.satuan,
        qty_dasar: item.qtyDasar,
        harga_beli: item.harga_beli, // original (per rim)
        subtotal: item.subtotal,
      });

      const stokSebelum = Number(item.product.stok_qty);
      const stokSesudah = stokSebelum + item.qtyDasar;

      // Update produk: stok dalam satuan dasar, harga_beli dalam satuan dasar
      item.product.stok_qty = stokSesudah;
      item.product.harga_beli = item.hargaBeliPerDasar; // <-- per lembar (base unit)
      await this.productRepo.save(item.product);

      // Catat movement
      await this.moveRepo.save({
        product_id: item.product_id,
        tipe: 'masuk',
        qty: item.qtyDasar,
        satuan: 'lembar', // simpan dalam satuan dasar
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
        referensi_id: purchase.id,
        keterangan: `Pembelian ${purchase_no} (${item.qty} ${item.satuan} @ Rp${item.harga_beli.toLocaleString('id-ID')})`,
        user_id: userId,
      });
    }

    return {
      ...purchase,
      items: itemsWithDasar.map((i) => ({
        product_id: i.product_id,
        nama: i.product.nama,
        qty: i.qty,
        satuan: i.satuan,
        qty_dasar: i.qtyDasar,
        harga_beli_per_dasar: i.hargaBeliPerDasar,
      })),
    };
  }

  async stockAdjust(userId: number, dto: StockAdjustDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.product_id } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    const faktor = this.getKonversiFaktor(dto.satuan);
    const qtyDasar = dto.qty * faktor;

    const stokSebelum = Number(product.stok_qty);
    if (stokSebelum < qtyDasar) {
      throw new BadRequestException(`Stok tidak cukup. Tersedia: ${stokSebelum}`);
    }
    const stokSesudah = stokSebelum - qtyDasar;

    product.stok_qty = stokSesudah;
    await this.productRepo.save(product);

    await this.moveRepo.save({
      product_id: dto.product_id,
      tipe: dto.tipe,
      qty: qtyDasar,
      satuan: 'lembar',
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      keterangan: dto.keterangan,
      user_id: userId,
    });

    return {
      product_id: dto.product_id,
      nama: product.nama,
      tipe: dto.tipe,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      selisih: -qtyDasar,
      keterangan: dto.keterangan,
    };
  }

  async findAllMovements(productId?: number) {
    const where: any = {};
    if (productId) where.product_id = productId;
    return this.moveRepo.find({ where, order: { created_at: 'DESC' }, take: 100 });
  }

  async findAllPurchases() {
    return this.purchaseRepo.find({ order: { created_at: 'DESC' }, take: 50 });
  }

  async findPurchaseDetail(id: number) {
    const purchase = await this.purchaseRepo.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException('Pembelian tidak ditemukan');
    const items = await this.purchaseItemRepo.find({ where: { purchase_id: id } });
    return { ...purchase, items };
  }
}