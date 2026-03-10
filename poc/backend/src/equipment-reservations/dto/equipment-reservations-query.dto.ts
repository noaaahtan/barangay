import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { EquipmentReservationStatus } from "../../common/constants";

export class EquipmentReservationsQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Filter by status",
    enum: EquipmentReservationStatus,
  })
  @IsOptional()
  @IsEnum(EquipmentReservationStatus)
  status?: EquipmentReservationStatus;

  @ApiPropertyOptional({ description: "Search by reference or event name" })
  @IsOptional()
  @IsString()
  search?: string;
}
