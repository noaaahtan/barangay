import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MaxLength,
} from "class-validator";
import { ApplicationType } from "../../common/constants";

export class CreateApplicationDto {
  @ApiProperty({
    description: "Type of document/service being applied for",
    enum: ApplicationType,
    example: ApplicationType.BARANGAY_CLEARANCE,
  })
  @IsNotEmpty()
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @ApiProperty({
    description: "Applicant full name",
    example: "Juan Dela Cruz",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  applicantName: string;

  @ApiProperty({
    description: "Applicant email address",
    example: "juan@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(200)
  applicantEmail: string;

  @ApiProperty({
    description: "Applicant phone number",
    example: "+63 912 345 6789",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  applicantPhone: string;

  @ApiProperty({
    description: "Applicant complete address",
    example: "Purok 1, Barangay Sta Ana, Manila",
  })
  @IsNotEmpty()
  @IsString()
  applicantAddress: string;

  @ApiProperty({
    description: "Purpose or reason for the application",
    example: "For job application requirements",
  })
  @IsNotEmpty()
  @IsString()
  purpose: string;
}
