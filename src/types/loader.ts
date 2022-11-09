import type { LoadingItemState } from "saga-query";

export interface AuthLoaderMessage {
  error: string;
  code: number;
  exception_context: { [key: string]: any };
}

export type AuthLoader = LoadingItemState<AuthLoaderMessage>;
