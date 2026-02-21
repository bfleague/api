import { IsNumberString, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNumberString()
  discordId!: string;

  @IsString()
  @Length(1, 25)
  username!: string;
}
