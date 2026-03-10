import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

export interface FindAllItemsOptions {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

export interface FindAllItemsResult {
  items: Item[];
  total: number;
}

export interface InventoryStatsRaw {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  totalCategories: number;
}

@Injectable()
export class ItemsRepository {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  async findAll(options: FindAllItemsOptions): Promise<FindAllItemsResult> {
    const { page, limit, search, categoryId } = options;
    const qb = this.repo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .orderBy('item.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        '(LOWER(item.name) LIKE :search OR LOWER(item.sku) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('item.category_id = :categoryId', { categoryId });
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  async findById(id: string): Promise<Item | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findBySku(sku: string): Promise<Item | null> {
    return this.repo.findOne({ where: { sku } });
  }

  async create(data: Partial<Item>): Promise<Item> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(item: Item): Promise<Item> {
    return this.repo.save(item);
  }

  async remove(item: Item): Promise<void> {
    await this.repo.remove(item);
  }

  async findLowStock(): Promise<Item[]> {
    return this.repo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.quantity <= item.low_stock_threshold')
      .orderBy('item.quantity', 'ASC')
      .getMany();
  }

  async getStats(): Promise<InventoryStatsRaw> {
    const totalItems = await this.repo.count();

    const lowStockCount = await this.repo
      .createQueryBuilder('item')
      .where('item.quantity <= item.low_stock_threshold')
      .getCount();

    const { totalValue } = await this.repo
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.quantity * item.price), 0)', 'totalValue')
      .getRawOne();

    const totalCategoriesResult = await this.repo
      .createQueryBuilder('item')
      .select('COUNT(DISTINCT item.category_id)', 'count')
      .where('item.category_id IS NOT NULL')
      .getRawOne();

    return {
      totalItems,
      lowStockCount,
      totalValue: parseFloat(totalValue),
      totalCategories: parseInt(totalCategoriesResult?.count || '0', 10),
    };
  }
}
