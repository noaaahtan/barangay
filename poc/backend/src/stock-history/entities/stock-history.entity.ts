import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../../items/entities/item.entity';

@Entity('stock_history')
export class StockHistory {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Item ID' })
  @Column({ name: 'item_id' })
  itemId: string;

  @ApiProperty({ description: 'Quantity change (positive or negative)' })
  @Column({ type: 'int', name: 'quantity_change' })
  quantityChange: number;

  @ApiProperty({ description: 'Quantity after this change' })
  @Column({ type: 'int', name: 'quantity_after' })
  quantityAfter: number;

  @ApiProperty({ description: 'Reason for the stock change' })
  @Column({ type: 'varchar', length: 500 })
  reason: string;

  @ApiProperty({ description: 'Timestamp of the change' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Item, (item) => item.stockHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
