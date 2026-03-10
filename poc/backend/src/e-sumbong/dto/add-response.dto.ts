import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AddResponseDto {
  @ApiProperty({ description: "Response message" })
  @IsString()
  responseText: string;
}
