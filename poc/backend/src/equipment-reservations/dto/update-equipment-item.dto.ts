import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsInt, Min, IsString } from "class-validator";
import { CreateEquipmentItemDto } from "./create-equipment-item.dto";

export class UpdateEquipmentItemDto extends PartialType(
  CreateEquipmentItemDto,
) {
  @ApiPropertyOptional({ description: "Display name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Total quantity" })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantityTotal?: number;
}
