import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemsRepository } from './items.repository';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { StockHistoryModule } from '../stock-history/stock-history.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    StockHistoryModule,
    AuditLogsModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsRepository, ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
