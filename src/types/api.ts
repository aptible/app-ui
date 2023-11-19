import type { ApiCtx } from "starfx";

import type { AuthApiError } from "./state";

export type { ApiCtx };
export type AppCtx<P = any, S = any> = ApiCtx<P, S, { message: string }>;
export type DeployApiCtx<P = any, S = any> = ApiCtx<P, S, { message: string }>;
export interface AuthApiCtx<P = any, S = any>
  extends ApiCtx<P, S, AuthApiError> {
  elevated: boolean;
  noToken: boolean;
  credentials: RequestCredentials;
}
export type MetricTunnelCtx<P = any, S = any> = ApiCtx<
  P,
  S,
  { message: string }
>;
