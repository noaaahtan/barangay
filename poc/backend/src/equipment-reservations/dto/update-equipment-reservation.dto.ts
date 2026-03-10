import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateEquipmentReservationDto } from "./create-equipment-reservation.dto";

export class UpdateEquipmentReservationDto extends PartialType(
  CreateEquipmentReservationDto,
) {
  @ApiPropertyOptional({ description: "Admin notes" })
  @IsOptional()
  @IsString()
  notes?: string;
}
