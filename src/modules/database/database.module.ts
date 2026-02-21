import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import { DatabaseService } from './database.service';
import { EnvSchema } from '../../env/env.schema';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MYSQL_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema, true>) =>
        createPool({
          uri: config.getOrThrow('DATABASE_URL', { infer: true }),
          waitForConnections: true,
          connectionLimit: 10,
        }),
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
