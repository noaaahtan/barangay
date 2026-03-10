import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { StockHistoryModule } from './stock-history/stock-history.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { getTypeOrmConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute (default)
      },
    ]),
    CategoriesModule,
    ItemsModule,
    StockHistoryModule,
    UsersModule,
    AuthModule,
    AuditLogsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
