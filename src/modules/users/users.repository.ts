import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import sql, { join, Sql } from 'sql-template-tag';
import { MysqlError } from '../../common/errors/mysql-error.enum';
import { getPageWindow } from '../../common/pagination/utils/page.util';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserAlreadyExistsError } from './users.error';
import { UserCredentials } from './types/user-credentials.type';
import { User } from './types/user.type';
import { PersistenceError } from '../database/database.error';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async find(
    tenant: string,
    page: number,
    pageSize: number,
    username?: string,
  ): Promise<Result<User[], PersistenceError>> {
    const { limitPlusOne, offset } = getPageWindow(page, pageSize);

    return username
      ? await this.db.query<User>`
          SELECT * FROM users
          WHERE tenant = ${tenant}
          AND username = ${username}
          ORDER BY created_at DESC, id DESC
          LIMIT ${limitPlusOne}
          OFFSET ${offset}
        `
      : await this.db.query<User>`
          SELECT * FROM users
          WHERE tenant = ${tenant}
          ORDER BY created_at DESC, id DESC
          LIMIT ${limitPlusOne}
          OFFSET ${offset}
        `;
  }

  async findByIdentity(
    provider: string,
    providerUserId: string,
    tenant: string,
  ): Promise<Result<User | null, PersistenceError>> {
    return await this.db.queryOne<User>`
      SELECT * FROM users
      WHERE tenant = ${tenant}
      AND provider = ${provider}
      AND provider_user_id = ${providerUserId}
    `;
  }

  async findById(
    userId: string,
    tenant: string,
  ): Promise<Result<User | null, PersistenceError>> {
    return await this.db.queryOne<User>`
      SELECT * FROM users
      WHERE tenant = ${tenant}
      AND id = ${userId}
    `;
  }

  async findCredentialsById(
    userId: string,
    tenant: string,
  ): Promise<Result<UserCredentials | null, PersistenceError>> {
    return await this.db.queryOne<UserCredentials>`
      SELECT provider_user_id, password FROM users
      WHERE tenant = ${tenant}
      AND id = ${userId}
    `;
  }

  async insertUser(
    input: CreateUserDto,
    tenant: string,
  ): Promise<Result<void, UserAlreadyExistsError | PersistenceError>> {
    const insertResult = await this.db.query`
      INSERT INTO users (tenant, provider, provider_user_id, username, password, role)
      VALUES (${tenant}, ${input.provider}, ${input.providerUserId}, ${input.username}, ${input.password ?? null}, ${input.role ?? 'default'})
    `;

    if (insertResult.isErr()) {
      switch (insertResult.error.code) {
        case MysqlError.DUP_ENTRY:
          return err({
            type: 'user_already_exists',
          });
        default:
          return err(insertResult.error);
      }
    }

    return ok();
  }

  async updateById(
    userId: string,
    input: UpdateUserDto,
    tenant: string,
  ): Promise<Result<void, UserAlreadyExistsError | PersistenceError>> {
    const changes: Sql[] = [];

    if (input.username !== undefined) {
      changes.push(sql`username = ${input.username}`);
    }

    if (input.password !== undefined) {
      changes.push(sql`password = ${input.password}`);
    }

    if (input.role !== undefined) {
      changes.push(sql`role = ${input.role}`);
    }

    if (changes.length === 0) {
      return ok();
    }

    const updateResult = await this.db.query(sql`
      UPDATE users
      SET ${join(changes, ', ')}
      WHERE tenant = ${tenant}
      AND id = ${userId}
    `);

    if (updateResult.isErr()) {
      switch (updateResult.error.code) {
        case MysqlError.DUP_ENTRY:
          return err({
            type: 'user_already_exists',
          });
        default:
          return err(updateResult.error);
      }
    }

    return ok();
  }
}
