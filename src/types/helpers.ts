import type { SagaIterator } from 'saga-query';

export const excludesFalse = <T>(n?: T): n is T => Boolean(n);

export type ApiGen<RT = void> = SagaIterator<RT>;

export interface Action<T extends string = string> {
  type: T;
}

export interface ActionWithPayload<P = any, T extends string = string> extends Action<T> {
  payload: P;
}

export interface MapEntity<E> {
  [key: string]: E | undefined;
}
