import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ minLength: 1, maxLength: 255, example: 'secret-password' })
  @IsString()
  @Length(1, 255)
  password!: string;
}
