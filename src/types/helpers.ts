import type { SagaIterator } from 'saga-query';
import type { Action } from 'redux';

export const excludesFalse = <T>(n?: T): n is T => Boolean(n);

export type ApiGen<RT = void> = SagaIterator<RT>;

export interface ActionWithPayload<P = any, T extends string = string>
  extends Action<T> {
  payload: P;
}

export interface MapEntity<E> {
  [key: string]: E | undefined;
}
