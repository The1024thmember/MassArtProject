export function isDefined<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}
