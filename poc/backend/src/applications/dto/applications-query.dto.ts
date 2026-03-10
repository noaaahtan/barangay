import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsInt, Min, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApplicationStatus, ApplicationType } from "../../common/constants";

export class ApplicationsQueryDto {
  @ApiPropertyOptional({
    description: "Page number",
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Filter by status",
    enum: ApplicationStatus,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: "Filter by application type",
    enum: ApplicationType,
  })
  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;

  @ApiPropertyOptional({
    description: "Search by reference number or applicant name",
    example: "APP-2026",
  })
  @IsOptional()
  @IsString()
  search?: string;
}
