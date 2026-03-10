import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ description: 'Item name', example: 'Holographic Cat Sticker' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Stock Keeping Unit', example: 'STK-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Initial quantity', example: 100, default: 0 })
  @IsInt()
  @Min(0)
  quantity: number = 0;

  @ApiProperty({ description: 'Unit price (₱)', example: 45.0, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number = 0;

  @ApiProperty({ description: 'Low stock alert threshold', example: 10, default: 10 })
  @IsInt()
  @Min(0)
  lowStockThreshold: number = 10;

  // ── Sticker Size ────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Width', example: 3 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ description: 'Height', example: 3 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ description: 'Size unit: in, cm, or mm', example: 'in', default: 'in' })
  @IsOptional()
  @IsString()
  @IsIn(['in', 'cm', 'mm'])
  sizeUnit?: string;

  // ── Image ───────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  // ── Relations ───────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
