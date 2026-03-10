import { Injectable, Logger } from "@nestjs/common";
import { StockHistoryRepository } from "./stock-history.repository";
import { StockHistory } from "./entities/stock-history.entity";

@Injectable()
export class StockHistoryService {
  private readonly logger = new Logger(StockHistoryService.name);

  constructor(private readonly stockHistoryRepo: StockHistoryRepository) {}

  async findByItem(itemId: string): Promise<StockHistory[]> {
    this.logger.log(`findByItem itemId=${itemId}`);
    return this.stockHistoryRepo.findByItemId(itemId);
  }

  async findRecent(limit: number = 20): Promise<StockHistory[]> {
    this.logger.log(`findRecent limit=${limit}`);
    return this.stockHistoryRepo.findRecent(limit);
  }
}
