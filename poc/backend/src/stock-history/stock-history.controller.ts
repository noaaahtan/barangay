import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StockHistoryService } from './stock-history.service';
import { StockHistory } from './entities/stock-history.entity';

@ApiTags('Stock History')
@Controller('stock-history')
export class StockHistoryController {
  constructor(private readonly stockHistoryService: StockHistoryService) {}

  @Get('recent')
  @ApiOperation({ summary: 'Get recent stock changes across all items' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [StockHistory] })
  findRecent(@Query('limit') limit?: number) {
    return this.stockHistoryService.findRecent(limit || 20);
  }

  @Get(':itemId')
  @ApiOperation({ summary: 'Get stock history for a specific item' })
  @ApiResponse({ status: 200, type: [StockHistory] })
  findByItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.stockHistoryService.findByItem(itemId);
  }
}
