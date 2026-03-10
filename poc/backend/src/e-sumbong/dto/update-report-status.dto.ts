import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsOptional } from "class-validator";
import { ReportStatus } from "../../common/constants";

export class UpdateReportStatusDto {
  @ApiProperty({ description: "New status", enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({
    description: "Optional notes for status change",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
