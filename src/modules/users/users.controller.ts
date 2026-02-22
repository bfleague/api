import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PagePaginationQueryDto } from '../../common/pagination/dtos/page-pagination-query.dto';
import { Tenant } from '../auth/decorators/tenant.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UsersPaginatedResponseDto } from './dtos/users-paginated-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(
    @Tenant() tenant: string,
    @Body() body: CreateUserDto,
  ): Promise<UserResponseDto> {
    const result = await this.service.create(body, tenant);

    if (result.isErr()) {
      switch (result.error.type) {
        case 'user_already_exists':
          throw new ConflictException('User already exists');
        case 'persistence_error':
          throw new InternalServerErrorException('Unexpected error');
      }
    }

    return new UserResponseDto(result.value);
  }

  @Get()
  @ApiOkResponse({ type: UsersPaginatedResponseDto })
  async list(
    @Tenant() tenant: string,
    @Query() query: PagePaginationQueryDto,
  ): Promise<UsersPaginatedResponseDto> {
    const result = await this.service.list(tenant, query);

    if (result.isErr()) {
      switch (result.error.type) {
        case 'persistence_error':
          throw new InternalServerErrorException('Unexpected error');
      }
    }

    return new UsersPaginatedResponseDto(result.value);
  }
}
