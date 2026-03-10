import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, Min } from "class-validator";
import { EquipmentType } from "../../common/constants";

export class EquipmentReservationItemDto {
  @ApiProperty({ description: "Equipment type", enum: EquipmentType })
  @IsEnum(EquipmentType)
  type: EquipmentType;

  @ApiProperty({ description: "Requested quantity", example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;
}
