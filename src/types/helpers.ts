// https://stackoverflow.com/a/47636222
export const excludesFalse = <T>(n?: T): n is T => Boolean(n);

// https://stackoverflow.com/a/72311590
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface Action<T extends string = string> {
  type: T;
}

export interface AnyAction<T extends string = string> extends Action<T> {
  [key: string]: any;
}

export interface ActionWithPayload<P = any, T extends string = string>
  extends Action<T> {
  payload: P;
}

export interface MapEntity<E> {
  [key: string]: E | undefined;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}
