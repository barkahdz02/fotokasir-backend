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

  async stockIn(userId: number, dto: StockInDto) {
    const purchase_no = await this.generatePurchaseNo();
    let total = 0;

    // Hitung total dulu
    const itemsWithDasar = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.productRepo.findOne({ where: { id: item.product_id } });
        if (!product) throw new NotFoundException(`Produk ID ${item.product_id} tidak ditemukan`);

        // Konversi qty ke satuan dasar (sederhana: 1 rim = 500 lembar untuk kertas)
        let qtyDasar = item.qty;
        if (item.satuan === 'rim') qtyDasar = item.qty * 500;
        else if (item.satuan === 'lusin') qtyDasar = item.qty * 12;

        const subtotal = item.qty * item.harga_beli;
        total += subtotal;

        return { ...item, product, qtyDasar, subtotal };
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
      await this.purchaseItemRepo.save({
        purchase_id: purchase.id,
        product_id: item.product_id,
        qty: item.qty,
        satuan: item.satuan,
        qty_dasar: item.qtyDasar,
        harga_beli: item.harga_beli,
        subtotal: item.subtotal,
      });

      const stokSebelum = Number(item.product.stok_qty);
      const stokSesudah = stokSebelum + item.qtyDasar;

      // Update produk
      item.product.stok_qty = stokSesudah;
      item.product.harga_beli = item.harga_beli;
      await this.productRepo.save(item.product);

      // Catat movement
      await this.moveRepo.save({
        product_id: item.product_id,
        tipe: 'masuk',
        qty: item.qtyDasar,
        satuan: item.satuan,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
        referensi_id: purchase.id,
        keterangan: `Pembelian ${purchase_no}`,
        user_id: userId,
      });
    }

    return { ...purchase, items: itemsWithDasar.map(i => ({ product_id: i.product_id, nama: i.product.nama, qty: i.qty, qty_dasar: i.qtyDasar })) };
  }

  async stockAdjust(userId: number, dto: StockAdjustDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.product_id } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    let qtyDasar = dto.qty;
    if (dto.satuan === 'rim') qtyDasar = dto.qty * 500;
    else if (dto.satuan === 'lusin') qtyDasar = dto.qty * 12;

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
      satuan: dto.satuan,
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