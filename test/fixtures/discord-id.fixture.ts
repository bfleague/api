import { uniqueDigitsFixture } from './unique-digits.fixture';

export function providerUserIdFixture(): string {
  return uniqueDigitsFixture();
}

export const discordIdFixture = providerUserIdFixture;
