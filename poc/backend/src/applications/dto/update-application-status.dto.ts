import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "../../common/constants";

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: "New status for the application",
    enum: ApplicationStatus,
    example: ApplicationStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: "Optional notes or remarks about the status change",
    example: "Approved after verification",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
