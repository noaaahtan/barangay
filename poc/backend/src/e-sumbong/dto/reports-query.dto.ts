import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import {
  ReportStatus,
  ReportType,
  ReportSeverity,
} from "../../common/constants";

export class ReportsQueryDto {
  @ApiProperty({
    description: "Filter by status (comma-separated)",
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: "Filter by report type (comma-separated)",
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: "Filter by severity (comma-separated)",
    required: false,
  })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiProperty({
    description: "Filter reports after this date",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Filter reports before this date",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Filter by user ID (admin only)",
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: "Geospatial bounding box: minLat,minLng,maxLat,maxLng",
    required: false,
  })
  @IsOptional()
  @IsString()
  bounds?: string;

  @ApiProperty({ description: "Page number", default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Results per page",
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
