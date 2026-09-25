import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './entities/service-type.entity';
import { ServiceAttribute } from './entities/service-attribute.entity';
import { ServicePrice } from './entities/service-price.entity';
import { CreateServiceTypeDto, CreateServicePriceDto, CreateAttributeDto } from './dto/service.dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType) private typeRepo: Repository<ServiceType>,
    @InjectRepository(ServiceAttribute) private attrRepo: Repository<ServiceAttribute>,
    @InjectRepository(ServicePrice) private priceRepo: Repository<ServicePrice>,
  ) {}

  async findAllTypes() {
    const types = await this.typeRepo.find({ where: { is_active: 1 }, order: { nama: 'ASC' } });
    return Promise.all(
      types.map(async (t) => ({
        ...t,
        dimensi: JSON.parse(t.dimensi || '[]'),
        total_prices: await this.priceRepo.count({ where: { service_type_id: t.id, is_active: 1 } }),
      })),
    );
  }

  async findOneType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Jenis jasa tidak ditemukan');
    return { ...t, dimensi: JSON.parse(t.dimensi || '[]') };
  }

  async createType(dto: CreateServiceTypeDto) {
    const t = this.typeRepo.create({
      nama: dto.nama,
      category_id: dto.category_id,
      satuan: dto.satuan,
      dimensi: JSON.stringify(dto.dimensi),
      formula_harga: dto.formula_harga || 'per_unit',
      is_active: 1,
    });
    const saved = await this.typeRepo.save(t);
    return { ...saved, dimensi: dto.dimensi };
  }

  async updateType(id: number, dto: Partial<CreateServiceTypeDto>) {
    const t = await this.findOneType(id);
    if (dto.nama) t.nama = dto.nama;
    if (dto.satuan) t.satuan = dto.satuan;
    if (dto.dimensi) t.dimensi = JSON.stringify(dto.dimensi);
    if (dto.formula_harga) t.formula_harga = dto.formula_harga;
    return this.typeRepo.save(t);
  }

  async deleteType(id: number) {
    const t = await this.findOneType(id);
    t.is_active = 0;
    await this.typeRepo.save(t);
    return { message: 'Jenis jasa dinonaktifkan' };
  }

  async findAllAttributes(dimensi?: string) {
    const where: any = { is_active: 1 };
    if (dimensi) where.dimensi = dimensi;
    return this.attrRepo.find({ where, order: { dimensi: 'ASC', urutan: 'ASC' } });
  }

  async createAttribute(dto: CreateAttributeDto) {
    const attr = this.attrRepo.create({ ...dto, urutan: dto.urutan || 0, is_active: 1 });
    return this.attrRepo.save(attr);
  }

  async deleteAttribute(id: number) {
    const attr = await this.attrRepo.findOne({ where: { id } });
    if (!attr) throw new NotFoundException('Atribut tidak ditemukan');
    attr.is_active = 0;
    await this.attrRepo.save(attr);
    return { message: 'Atribut dinonaktifkan' };
  }

  async findPrices(serviceTypeId: number) {
    const prices = await this.priceRepo.find({
      where: { service_type_id: serviceTypeId, is_active: 1 },
    });
    return prices.map((p) => ({ ...p, kombinasi: JSON.parse(p.kombinasi || '{}') }));
  }

  async createPrice(serviceTypeId: number, dto: CreateServicePriceDto) {
    await this.findOneType(serviceTypeId);
    const p = this.priceRepo.create({
      service_type_id: serviceTypeId,
      kombinasi: JSON.stringify(dto.kombinasi),
      harga: dto.harga,
      min_qty: dto.min_qty || 1,
      max_qty: dto.max_qty,
      is_active: 1,
    });
    const saved = await this.priceRepo.save(p);
    return { ...saved, kombinasi: dto.kombinasi };
  }

  async deletePrice(id: number) {
    const p = await this.priceRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Harga tidak ditemukan');
    p.is_active = 0;
    await this.priceRepo.save(p);
    return { message: 'Harga dinonaktifkan' };
  }

  async lookupPrice(serviceTypeId: number, kombinasi: Record<string, string>, qty = 1) {
    const prices = await this.priceRepo.find({
      where: { service_type_id: serviceTypeId, is_active: 1 },
    });

    for (const p of prices) {
      const pKomb = JSON.parse(p.kombinasi || '{}');
      const match = Object.keys(kombinasi).every((k) => pKomb[k] === kombinasi[k]);
      const qtyMatch = qty >= p.min_qty && (!p.max_qty || qty <= p.max_qty);
      if (match && qtyMatch) {
        return { harga: Number(p.harga), kombinasi: pKomb };
      }
    }
    throw new BadRequestException('Kombinasi harga tidak ditemukan');
  }
}