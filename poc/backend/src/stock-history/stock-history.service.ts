import { Injectable } from '@nestjs/common';
import { StockHistoryRepository } from './stock-history.repository';
import { StockHistory } from './entities/stock-history.entity';

@Injectable()
export class StockHistoryService {
  constructor(private readonly stockHistoryRepo: StockHistoryRepository) {}

  async findByItem(itemId: string): Promise<StockHistory[]> {
    return this.stockHistoryRepo.findByItemId(itemId);
  }

  async findRecent(limit: number = 20): Promise<StockHistory[]> {
    return this.stockHistoryRepo.findRecent(limit);
  }
}
