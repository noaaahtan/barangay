import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ItemsRepository } from './items.repository';
import { StockHistoryRepository } from '../stock-history/stock-history.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/entities/audit-log.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ItemsQueryDto } from './dto/items-query.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    private readonly itemsRepo: ItemsRepository,
    private readonly stockHistoryRepo: StockHistoryRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: ItemsQueryDto) {
    const { page, limit, search, categoryId } = query;
    const { items, total } = await this.itemsRepo.findAll({ page, limit, search, categoryId });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepo.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with id "${id}" not found`);
    }
    return item;
  }

  async create(dto: CreateItemDto, userId: string): Promise<Item> {
    const existing = await this.itemsRepo.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`Item with SKU "${dto.sku}" already exists`);
    }

    const saved = await this.itemsRepo.create(dto);

    // Log initial stock if quantity > 0
    if (dto.quantity > 0) {
      await this.logStockChange(saved, dto.quantity, 'Initial stock');
    }

    await this.auditLogsService.log(
      AuditAction.CREATE,
      'item',
      saved.id,
      saved.name,
      userId,
      `Created item "${saved.name}" (SKU: ${saved.sku})`,
    );

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateItemDto, userId: string): Promise<Item> {
    const item = await this.findOne(id);

    if (dto.sku && dto.sku !== item.sku) {
      const existing = await this.itemsRepo.findBySku(dto.sku);
      if (existing) {
        throw new ConflictException(`Item with SKU "${dto.sku}" already exists`);
      }
    }

    // Track quantity change if quantity is being updated directly
    const oldQuantity = item.quantity;
    Object.assign(item, dto);
    await this.itemsRepo.save(item);

    if (dto.quantity !== undefined && dto.quantity !== oldQuantity) {
      const change = dto.quantity - oldQuantity;
      await this.logStockChange(item, change, 'Manual quantity update');
    }

    // Build details summary
    const changedFields = Object.keys(dto).filter((k) => k !== 'imageUrl');
    const details = changedFields.length > 0
      ? `Updated ${changedFields.join(', ')}`
      : 'Updated image';

    await this.auditLogsService.log(
      AuditAction.UPDATE,
      'item',
      item.id,
      item.name,
      userId,
      details,
    );

    return this.findOne(item.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findOne(id);
    await this.itemsRepo.remove(item);

    await this.auditLogsService.log(
      AuditAction.DELETE,
      'item',
      id,
      item.name,
      userId,
      `Deleted item "${item.name}" (SKU: ${item.sku})`,
    );
  }

  async adjustStock(id: string, dto: AdjustStockDto, userId: string): Promise<Item> {
    const item = await this.findOne(id);
    const newQuantity = item.quantity + dto.quantityChange;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Cannot adjust stock: would result in negative quantity (${newQuantity})`,
      );
    }

    item.quantity = newQuantity;
    await this.itemsRepo.save(item);
    await this.logStockChange(item, dto.quantityChange, dto.reason);

    const sign = dto.quantityChange >= 0 ? '+' : '';
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      'item',
      item.id,
      item.name,
      userId,
      `Stock adjusted ${sign}${dto.quantityChange} — ${dto.reason}`,
    );

    return this.findOne(item.id);
  }

  async findLowStock(): Promise<Item[]> {
    return this.itemsRepo.findLowStock();
  }

  async getStats() {
    return this.itemsRepo.getStats();
  }

  private async logStockChange(
    item: Item,
    quantityChange: number,
    reason: string,
  ): Promise<void> {
    await this.stockHistoryRepo.create({
      itemId: item.id,
      quantityChange,
      quantityAfter: item.quantity,
      reason,
    });
  }
}
