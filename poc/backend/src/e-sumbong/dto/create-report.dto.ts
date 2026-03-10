import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from "class-validator";
import { ReportType, ReportSeverity } from "../../common/constants";

export class CreateReportDto {
  @ApiProperty({ description: "Report type", enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: "Severity level", enum: ReportSeverity })
  @IsEnum(ReportSeverity)
  severity: ReportSeverity;

  @ApiProperty({ description: "Report title", maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: "Detailed description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Location latitude", example: 14.5995 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: "Location longitude", example: 120.9842 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: "Human-readable location address",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  locationAddress?: string;

  @ApiProperty({
    description: "Whether report is anonymous",
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: "Array of photo URLs",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
