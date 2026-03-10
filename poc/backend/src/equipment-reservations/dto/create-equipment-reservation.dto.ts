import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { EquipmentReservationItemDto } from "./equipment-reservation-item.dto";
import { EventType } from "../../common/constants";

export class CreateEquipmentReservationDto {
  @ApiProperty({
    description: "Event type",
    enum: EventType,
    example: EventType.COMMUNITY_EVENT,
  })
  @IsNotEmpty()
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ description: "Event name", example: "Barangay Fiesta" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  eventName: string;

  @ApiProperty({ description: "Event location", example: "Barangay Hall" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  eventLocation: string;

  @ApiProperty({ description: "Reservation start date", example: "2026-03-15" })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: "Reservation end date", example: "2026-03-16" })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: "Requested equipment items",
    type: [EquipmentReservationItemDto],
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EquipmentReservationItemDto)
  requestedItems: EquipmentReservationItemDto[];
}
