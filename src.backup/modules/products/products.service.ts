import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findAll(search?: string, category_id?: number, tipe?: string) {
    const qb = this.repo.createQueryBuilder('p').where('p.is_active = 1');

    if (search) {
      qb.andWhere('(p.nama LIKE :s OR p.sku LIKE :s OR p.barcode LIKE :s)', {
        s: `%${search}%`,
      });
    }
    if (category_id) qb.andWhere('p.category_id = :cid', { cid: category_id });
    if (tipe) qb.andWhere('p.tipe = :tipe', { tipe });

    return qb.orderBy('p.nama', 'ASC').getMany();
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Produk tidak ditemukan');
    return p;
  }

  async findByBarcode(barcode: string) {
    const p = await this.repo.findOne({ where: { barcode, is_active: 1 } });
    if (!p) throw new NotFoundException('Produk dengan barcode ini tidak ditemukan');
    return p;
  }

  async findLowStock() {
    return this.repo
      .createQueryBuilder('p')
      .where('p.tipe = :tipe', { tipe: 'produk' })
      .andWhere('p.is_active = 1')
      .andWhere('p.stok_qty <= p.stok_minimum')
      .orderBy('p.stok_qty', 'ASC')
      .getMany();
  }

  async create(dto: CreateProductDto, userId?: number) {
    if (dto.sku) {
      const existing = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existing) throw new BadRequestException('SKU sudah dipakai');
    }

    const product = this.repo.create({
      sku: dto.sku,
      barcode: dto.barcode || dto.sku,
      nama: dto.nama,
      category_id: dto.category_id,
      tipe: dto.tipe,
      satuan_dasar_id: dto.satuan_dasar_id,
      stok_qty: dto.stok_qty || 0,
      stok_minimum: dto.stok_minimum || 0,
      harga_beli: dto.harga_beli || 0,
      harga_jual: dto.harga_jual,
      deskripsi: dto.deskripsi,
      metadata: '{}',
      is_active: 1,
      created_by: userId,
    });

    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.nama) product.nama = dto.nama;
    if (dto.category_id) product.category_id = dto.category_id;
    if (dto.stok_qty !== undefined) product.stok_qty = dto.stok_qty;
    if (dto.stok_minimum !== undefined) product.stok_minimum = dto.stok_minimum;
    if (dto.harga_beli !== undefined) product.harga_beli = dto.harga_beli;
    if (dto.harga_jual !== undefined) product.harga_jual = dto.harga_jual;
    if (dto.deskripsi !== undefined) product.deskripsi = dto.deskripsi;
    if (dto.is_active !== undefined) product.is_active = dto.is_active ? 1 : 0;
    product.updated_at = new Date();
    return this.repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    product.is_active = 0;
    await this.repo.save(product);
    return { message: 'Produk dinonaktifkan' };
  }
}