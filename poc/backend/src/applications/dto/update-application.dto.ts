import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { CreateApplicationDto } from "./create-application.dto";

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiPropertyOptional({
    description: "Admin notes or remarks",
    example: "Pending additional documents",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
