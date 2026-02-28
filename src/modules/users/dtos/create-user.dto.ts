import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsLowercase,
  IsIn,
  Matches,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { USER_ROLES, UserRole } from '../types/user-role.type';

export class CreateUserDto {
  @ApiProperty({ example: 'discord' })
  @IsString()
  @IsLowercase()
  @Length(2, 32)
  @Matches(/^[a-z0-9][a-z0-9._-]*$/)
  provider!: string;

  @ApiProperty({ example: '123456789012345678' })
  @IsString()
  @Length(1, 191)
  providerUserId!: string;

  @ApiProperty({ minLength: 1, maxLength: 25, example: 'Alice' })
  @IsString()
  @Length(1, 25)
  username!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    minLength: 4,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(4, 20)
  password?: string | null;

  @ApiPropertyOptional({
    enum: USER_ROLES,
    example: 'default',
  })
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}
