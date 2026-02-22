import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { USER_ROLES, UserRole } from '../types/user-role.type';
import { User } from '../types/user.type';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenant: string;

  @ApiProperty({ name: 'discord_id' })
  @Expose({ name: 'discord_id' })
  discordId: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: USER_ROLES })
  role: UserRole;

  @ApiProperty({ name: 'created_at', type: String, format: 'date-time' })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.tenant = user.tenant;
    this.discordId = user.discordId;
    this.username = user.username;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}
