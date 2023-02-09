import type { LoadingItemState } from "saga-query";

export interface AuthLoaderMessage {
  error: string;
  code: number;
  exception_context: { [key: string]: any };
  verified: boolean;
  id: string;
}

export type AuthLoader = LoadingItemState<AuthLoaderMessage>;
