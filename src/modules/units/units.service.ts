import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(@InjectRepository(Unit) private repo: Repository<Unit>) {}

  findAll() {
    return this.repo.find({ order: { nama: 'ASC' } });
  }

  async findOne(id: number) {
    const unit = await this.repo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Satuan tidak ditemukan');
    return unit;
  }

  async create(dto: CreateUnitDto) {
    const existing = await this.repo.findOne({ where: { nama: dto.nama } });
    if (existing) throw new BadRequestException('Satuan sudah ada');
    const unit = this.repo.create(dto);
    return this.repo.save(unit);
  }

  async update(id: number, dto: Partial<CreateUnitDto>) {
    const unit = await this.findOne(id);
    if (dto.nama) unit.nama = dto.nama;
    if (dto.singkatan !== undefined) unit.singkatan = dto.singkatan;
    return this.repo.save(unit);
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    await this.repo.remove(unit);
    return { message: 'Satuan dihapus' };
  }
}