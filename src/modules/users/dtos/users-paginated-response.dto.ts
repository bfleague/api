import { PaginationDto } from '../../../common/pagination/dtos/pagination.dto';
import { User } from '../types/user.type';
import { UserResponseDto } from './user-response.dto';

export class UsersPaginatedResponseDto extends PaginationDto(
  UserResponseDto,
  (user: User) => new UserResponseDto(user),
) {}
