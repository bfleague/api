import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ConfirmUserDto {
  @ApiProperty({ minLength: 4, maxLength: 20, example: 'secret-password' })
  @IsString()
  @Length(4, 20)
  password!: string;
}
