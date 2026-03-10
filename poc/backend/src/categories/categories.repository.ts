import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(data: Partial<Category>): Promise<Category> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(category: Category): Promise<Category> {
    return this.repo.save(category);
  }

  async remove(category: Category): Promise<void> {
    await this.repo.remove(category);
  }
}
