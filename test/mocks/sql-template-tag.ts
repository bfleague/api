export class Sql {
  constructor(
    public readonly strings: readonly string[],
    public readonly values: readonly unknown[],
  ) {
    const mergedStrings: string[] = [strings[0] ?? ''];
    const mergedValues: unknown[] = [];

    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      const nextString = strings[index + 1] ?? '';

      if (value instanceof Sql) {
        mergedStrings[mergedStrings.length - 1] += value.strings[0] ?? '';

        for (
          let nestedIndex = 0;
          nestedIndex < value.values.length;
          nestedIndex += 1
        ) {
          mergedValues.push(value.values[nestedIndex]);
          mergedStrings.push(value.strings[nestedIndex + 1] ?? '');
        }

        mergedStrings[mergedStrings.length - 1] += nextString;
      } else {
        mergedValues.push(value);
        mergedStrings.push(nextString);
      }
    }

    this.strings = mergedStrings;
    this.values = mergedValues;
  }

  get text(): string {
    return this.strings.reduce(
      (acc, segment, index) =>
        acc + segment + (index < this.values.length ? '?' : ''),
      '',
    );
  }
}

export default function sql(
  strings: readonly string[],
  ...values: readonly unknown[]
): Sql {
  return new Sql(strings, values);
}

export function join(
  values: readonly unknown[],
  separator = ', ',
  prefix = '',
  suffix = '',
): Sql {
  if (values.length === 0) {
    return new Sql([prefix + suffix], []);
  }

  const strings: string[] = [prefix];

  for (let index = 0; index < values.length; index += 1) {
    if (index > 0) {
      strings[strings.length - 1] += separator;
    }

    strings.push('');
  }

  strings[strings.length - 1] += suffix;

  return new Sql(strings, [...values]);
}
