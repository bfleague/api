import { ApiProperty } from '@nestjs/swagger';
import { User } from '../types/user.type';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenant: string;

  @ApiProperty()
  discordId: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.tenant = user.tenant;
    this.discordId = user.discordId;
    this.username = user.username;
    this.createdAt = user.createdAt;
  }
}
