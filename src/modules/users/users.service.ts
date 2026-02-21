import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { ok as assert } from 'node:assert/strict';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserAlreadyExistsError } from './users.error';
import { User } from './types/user.type';
import { UsersRepository } from './users.repository';
import { PersistenceError } from '../database/database.error';

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

  list(tenant: string): Promise<Result<User[], PersistenceError>> {
    return this.repo.findAll(tenant);
  }
}
