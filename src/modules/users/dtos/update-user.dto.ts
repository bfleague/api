import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { USER_ROLES, UserRole } from '../types/user-role.type';

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 25, example: 'Alice' })
  @IsOptional()
  @IsString()
  @Length(1, 25)
  username?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    minLength: 4,
    maxLength: 20,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Length(4, 20)
  password?: string | null;

  @ApiPropertyOptional({
    enum: USER_ROLES,
    example: 'mod',
  })
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}
