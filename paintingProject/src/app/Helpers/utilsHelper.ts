import { Observable, isObservable, of } from 'rxjs';

export function isDefined<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}

export function toObservable<T>(x$: T | Observable<T>): Observable<T> {
  return isObservable(x$) ? x$ : of(x$);
}

export function arrayIsShallowEqual<T>(
  a?: readonly T[],
  b?: readonly T[]
): boolean {
  return Boolean(
    a &&
      b &&
      a.length === b.length &&
      a.every((entity, index) => entity === b[index])
  );
}
