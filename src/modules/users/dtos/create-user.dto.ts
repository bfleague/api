import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '123456789012345678' })
  @IsNumberString()
  discordId!: string;

  @ApiProperty({ minLength: 1, maxLength: 25, example: 'Alice' })
  @IsString()
  @Length(1, 25)
  username!: string;
}
