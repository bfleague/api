import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Tenant } from '../auth/decorators/tenant.decorator';
import { ConfirmUserDto } from './dtos/confirm-user.dto';
import { ConfirmUserResponseDto } from './dtos/confirm-user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUsersQueryDto } from './dtos/list-users-query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
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
    @Query() query: ListUsersQueryDto,
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

  @Get('provider/:provider/:providerUserId')
  @ApiOkResponse({ type: UserResponseDto })
  async getByIdentity(
    @Tenant() tenant: string,
    @Param('provider') provider: string,
    @Param('providerUserId') providerUserId: string,
  ): Promise<UserResponseDto> {
    const result = await this.service.getByIdentity(
      provider,
      providerUserId,
      tenant,
    );

    if (result.isErr()) {
      switch (result.error.type) {
        case 'user_not_found':
          throw new NotFoundException('User not found');
        case 'persistence_error':
          throw new InternalServerErrorException('Unexpected error');
      }
    }

    return new UserResponseDto(result.value);
  }

  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  async update(
    @Tenant() tenant: string,
    @Param('id') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const result = await this.service.update(userId, body, tenant);

    if (result.isErr()) {
      switch (result.error.type) {
        case 'user_not_found':
          throw new NotFoundException('User not found');
        case 'user_already_exists':
          throw new ConflictException('User already exists');
        case 'persistence_error':
          throw new InternalServerErrorException('Unexpected error');
      }
    }

    return new UserResponseDto(result.value);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  @ApiBody({ type: ConfirmUserDto })
  @ApiOkResponse({ type: ConfirmUserResponseDto })
  async confirm(
    @Tenant() tenant: string,
    @Param('id') userId: string,
    @Body() body: ConfirmUserDto,
  ): Promise<ConfirmUserResponseDto> {
    const result = await this.service.confirm(userId, body, tenant);

    if (result.isErr()) {
      switch (result.error.type) {
        case 'persistence_error':
          throw new InternalServerErrorException('Unexpected error');
      }
    }

    return new ConfirmUserResponseDto(result.value);
  }
}
