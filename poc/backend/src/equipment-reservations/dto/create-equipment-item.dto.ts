import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { EquipmentType } from "../../common/constants";

export class CreateEquipmentItemDto {
  @ApiProperty({ description: "Equipment type", enum: EquipmentType })
  @IsEnum(EquipmentType)
  type: EquipmentType;

  @ApiProperty({ description: "Display name", example: "Plastic Chair" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: "Total quantity", example: 100 })
  @IsInt()
  @Min(0)
  quantityTotal: number;
}
