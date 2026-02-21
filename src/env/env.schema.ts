import {
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvSchema {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_PUBLIC_KEY!: string;

  @IsString()
  @IsNotEmpty()
  JWT_PRIVATE_KEY!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ALGO!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ISS!: string;

  @IsString()
  @IsNotEmpty()
  JWT_AUD!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXP!: string;

  @IsNumber()
  PORT!: number;
}

export function validateEnv(config: Record<string, unknown>): EnvSchema {
  const validated = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formatted = errors
      .map((err) => Object.values(err.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`❌ Invalid environment variables: ${formatted}`);
  }

  return validated;
}
