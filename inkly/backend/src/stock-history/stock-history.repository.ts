import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockHistory } from './entities/stock-history.entity';

@Injectable()
export class StockHistoryRepository {
  constructor(
    @InjectRepository(StockHistory)
    private readonly repo: Repository<StockHistory>,
  ) {}

  async findByItemId(itemId: string): Promise<StockHistory[]> {
    return this.repo.find({
      where: { itemId },
      order: { createdAt: 'DESC' },
    });
  }

  async findRecent(limit: number): Promise<StockHistory[]> {
    return this.repo.find({
      relations: ['item'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(data: Partial<StockHistory>): Promise<StockHistory> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
