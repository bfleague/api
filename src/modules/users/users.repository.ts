import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { MysqlError } from '../../common/errors/mysql-error.enum';
import { getPageWindow } from '../../common/pagination/utils/page.util';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserAlreadyExistsError } from './users.error';
import { User } from './types/user.type';
import { PersistenceError } from '../database/database.error';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async find(
    tenant: string,
    page: number,
    pageSize: number,
  ): Promise<Result<User[], PersistenceError>> {
    const { limitPlusOne, offset } = getPageWindow(page, pageSize);

    return await this.db.query<User>`
      SELECT * FROM users
      WHERE tenant = ${tenant}
      ORDER BY created_at DESC, id DESC
      LIMIT ${limitPlusOne}
      OFFSET ${offset}
    `;
  }

  async findByDiscordId(
    discordId: string,
    tenant: string,
  ): Promise<Result<User | null, PersistenceError>> {
    return await this.db.queryOne<User>`
      SELECT * FROM users
      WHERE tenant = ${tenant}
      AND discord_id = ${discordId}
    `;
  }

  async insertUser(
    input: CreateUserDto,
    tenant: string,
  ): Promise<Result<void, UserAlreadyExistsError | PersistenceError>> {
    const insertResult = await this.db.query`
      INSERT INTO users (tenant, discord_id, username)
      VALUES (${tenant}, ${input.discordId}, ${input.username})
    `;

    if (insertResult.isErr()) {
      switch (insertResult.error.code) {
        case MysqlError.DUP_ENTRY:
          return err({
            type: 'user_already_exists',
            discordId: input.discordId,
          });
        default:
          return err(insertResult.error);
      }
    }

    return ok();
  }
}
