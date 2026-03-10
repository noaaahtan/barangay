import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResolveReportDto {
  @ApiProperty({ description: "Description of resolution" })
  @IsString()
  resolutionDetails: string;
}
