export function uniqueDigitsFixture(): string {
  return `${Date.now()}${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;
}
