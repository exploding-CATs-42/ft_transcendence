type Success<T> = { ok: true; value: T };
type Failure<E> = { ok: false; error: E };
export type Result<T, E> = Success<T> | Failure<E>;

export const failure = <E>(error: E): Failure<E> => ({ ok: false, error });

export function success(): Success<void>;
export function success<T>(value: T): Success<T>;

export function success<T>(value?: T): Success<T | void> {
  return { ok: true, value };
}
