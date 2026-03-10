import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'noah@inkly.ph' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '********',
    writeOnly: true, // Hide in Swagger response examples
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
