import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { ok as assert } from 'node:assert/strict';
import { Page } from '../../common/pagination/types/page.type';
import { paginate } from '../../common/pagination/utils/page.util';
import { PersistenceError } from '../database/database.error';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ConfirmUserDto } from './dtos/confirm-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUsersQueryDto } from './dtos/list-users-query.dto';
import { ConfirmationResult } from './types/confirmation-result.type';
import { UserAlreadyExistsError, UserNotFoundError } from './users.error';
import { User } from './types/user.type';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async create(
    dto: CreateUserDto,
    tenant: string,
  ): Promise<Result<User, UserAlreadyExistsError | PersistenceError>> {
    const insertResult = await this.repo.insertUser(dto, tenant);

    if (insertResult.isErr()) {
      return err(insertResult.error);
    }

    const userResult = await this.repo.findByDiscordId(dto.discordId, tenant);

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    assert(userResult.value, 'Invariant violated: expected user to exist');

    return ok(userResult.value);
  }

  async list(
    tenant: string,
    query: ListUsersQueryDto,
  ): Promise<Result<Page<User>, PersistenceError>> {
    return await this.repo
      .find(tenant, query.page, query.pageSize, query.username)
      .then((res) =>
        res.map((rows) => paginate(rows, query.page, query.pageSize)),
      );
  }

  async getByDiscordId(
    discordId: string,
    tenant: string,
  ): Promise<Result<User, UserNotFoundError | PersistenceError>> {
    const userResult = await this.repo.findByDiscordId(discordId, tenant);

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    if (!userResult.value) {
      return err({
        type: 'user_not_found',
        discordId,
      });
    }

    return ok(userResult.value);
  }

  async changePassword(
    discordId: string,
    dto: ChangePasswordDto,
    tenant: string,
  ): Promise<Result<void, UserNotFoundError | PersistenceError>> {
    const existingUserResult = await this.repo.findByDiscordId(
      discordId,
      tenant,
    );

    if (existingUserResult.isErr()) {
      return err(existingUserResult.error);
    }

    if (!existingUserResult.value) {
      return err({
        type: 'user_not_found',
        discordId,
      });
    }

    return await this.repo.changePasswordByDiscordId(
      discordId,
      dto.password,
      tenant,
    );
  }

  async confirm(
    discordId: string,
    dto: ConfirmUserDto,
    tenant: string,
  ): Promise<Result<ConfirmationResult, PersistenceError>> {
    const userResult = await this.repo.findCredentialsByDiscordId(
      discordId,
      tenant,
    );

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    if (!userResult.value) {
      return ok({
        isCorrect: false,
        discordId: null,
      });
    }

    return ok({
      isCorrect:
        userResult.value.password !== null &&
        userResult.value.password === dto.password,
      discordId: userResult.value.discordId,
    });
  }
}
