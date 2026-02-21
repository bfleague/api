import { INestApplication } from '@nestjs/common';

export type E2ERuntime = {
  app: INestApplication;
  baseUrl: string;
};

let runtime: E2ERuntime | null = null;

export function setE2ERuntime(value: E2ERuntime): void {
  runtime = value;
}

export function getE2ERuntime(): E2ERuntime {
  if (!runtime) {
    throw new Error('E2E runtime is not initialized');
  }

  return runtime;
}

export function clearE2ERuntime(): void {
  runtime = null;
}
