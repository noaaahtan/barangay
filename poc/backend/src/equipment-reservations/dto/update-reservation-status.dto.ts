import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EquipmentReservationStatus } from "../../common/constants";
import { EquipmentReservationItemDto } from "./equipment-reservation-item.dto";

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: "New status for the reservation",
    enum: EquipmentReservationStatus,
  })
  @IsEnum(EquipmentReservationStatus)
  status: EquipmentReservationStatus;

  @ApiPropertyOptional({
    description: "Approved items (optional overrides)",
    type: [EquipmentReservationItemDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EquipmentReservationItemDto)
  approvedItems?: EquipmentReservationItemDto[];

  @ApiPropertyOptional({ description: "Optional notes" })
  @IsOptional()
  @IsString()
  notes?: string;
}
