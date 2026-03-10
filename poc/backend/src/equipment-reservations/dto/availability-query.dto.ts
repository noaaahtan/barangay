import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";

export class AvailabilityQueryDto {
  @ApiProperty({ description: "Start date", example: "2026-03-15" })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: "End date", example: "2026-03-16" })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
