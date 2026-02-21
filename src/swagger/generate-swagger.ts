import 'reflect-metadata';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { stringify } from 'yaml';
import { AppModule } from '../modules/app.module';
import { buildSwaggerConfig } from './swagger.config';

async function generateSwagger(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    const config = buildSwaggerConfig();
    const document = SwaggerModule.createDocument(app, config);
    const outputPath = resolve(process.cwd(), 'docs/api/swagger.yaml');

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, stringify(document), 'utf8');
  } finally {
    await app.close();
  }
}

void generateSwagger();
