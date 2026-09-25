import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
  ) {}

  findAll(tipe?: string) {
    const where = tipe ? { tipe, is_active: 1 } : { is_active: 1 };
    return this.repo.find({ where, order: { urutan: 'ASC', nama: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const cat = this.repo.create({ ...dto, urutan: dto.urutan || 0, is_active: 1 });
    return this.repo.save(cat);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    if (dto.nama) cat.nama = dto.nama;
    if (dto.deskripsi !== undefined) cat.deskripsi = dto.deskripsi;
    if (dto.urutan !== undefined) cat.urutan = dto.urutan;
    if (dto.is_active !== undefined) cat.is_active = dto.is_active ? 1 : 0;
    return this.repo.save(cat);
  }

  async remove(id: number) {
    const cat = await this.findOne(id);
    cat.is_active = 0;
    await this.repo.save(cat);
    return { message: 'Kategori dinonaktifkan' };
  }
}