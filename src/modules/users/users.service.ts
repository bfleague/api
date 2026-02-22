import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { ok as assert } from 'node:assert/strict';
import { PagePaginationQueryDto } from '../../common/pagination/dtos/page-pagination-query.dto';
import { Page } from '../../common/pagination/types/page.type';
import { paginate } from '../../common/pagination/utils/page.util';
import { PersistenceError } from '../database/database.error';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserAlreadyExistsError } from './users.error';
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
    query: PagePaginationQueryDto,
  ): Promise<Result<Page<User>, PersistenceError>> {
    return await this.repo
      .find(tenant, query.page, query.pageSize)
      .then((res) =>
        res.map((rows) => paginate(rows, query.page, query.pageSize)),
      );
  }
}
