import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Quantity change (positive to add, negative to remove)',
    example: -5,
  })
  @IsInt()
  @IsNotEmpty()
  quantityChange: number;

  @ApiProperty({
    description: 'Reason for stock adjustment',
    example: 'Sold 5 units',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
