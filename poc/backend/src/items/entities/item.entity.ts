import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { StockHistory } from '../../stock-history/entities/stock-history.entity';

@Entity('items')
export class Item {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Item name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Stock Keeping Unit — unique identifier' })
  @Column({ unique: true })
  sku: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Current quantity in stock', default: 0 })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ description: 'Low stock alert threshold', default: 10 })
  @Column({ type: 'int', name: 'low_stock_threshold', default: 10 })
  lowStockThreshold: number;

  // ── Sticker Size Fields ─────────────────────────────────
  @ApiPropertyOptional({ description: 'Width of the sticker', example: 3 })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number | null;

  @ApiPropertyOptional({ description: 'Height of the sticker', example: 3 })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number | null;

  @ApiPropertyOptional({ description: 'Size measurement unit', example: 'in', default: 'in' })
  @Column({ name: 'size_unit', length: 10, default: 'in' })
  sizeUnit: string;

  // ── Image ───────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Product image URL' })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  // ── Relations ───────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Category ID' })
  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.items, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => StockHistory, (history) => history.item)
  stockHistory: StockHistory[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
