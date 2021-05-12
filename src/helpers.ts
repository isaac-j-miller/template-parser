export function assertNever(value: never, errorMessage?: string): never {
  throw new Error(errorMessage || `Unexpected value: ${String(value)}`);
}

export function assertIsDefined<T>(value?: T | null, errorMessage?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(errorMessage || "The value must be defined and not null.");
  }
}
