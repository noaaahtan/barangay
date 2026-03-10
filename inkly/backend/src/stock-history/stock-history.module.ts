import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockHistory } from './entities/stock-history.entity';
import { StockHistoryRepository } from './stock-history.repository';
import { StockHistoryService } from './stock-history.service';
import { StockHistoryController } from './stock-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockHistory])],
  controllers: [StockHistoryController],
  providers: [StockHistoryRepository, StockHistoryService],
  exports: [StockHistoryService, StockHistoryRepository],
})
export class StockHistoryModule {}
