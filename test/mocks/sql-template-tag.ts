export class Sql {
  constructor(
    public readonly strings: readonly string[],
    public readonly values: readonly unknown[],
  ) {}

  get text(): string {
    return this.strings.reduce(
      (acc, segment, index) =>
        acc + segment + (index < this.values.length ? '?' : ''),
      '',
    );
  }
}

export default function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Sql {
  return new Sql(strings, values);
}
