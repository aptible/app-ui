import type { CredentialRequestOptionsJSON } from "@github/webauthn-json";
import type { ApiCtx } from "starfx";

export type AuthErrorType =
  | "otp_token_required"
  | "unprocessable_entity"
  | "invalid_credentials"
  | "invalid_email"
  | "unsupported_grant_type"
  | "access_denied"
  | "invalid_scope"
  | "";

export interface AuthLoaderMeta {
  error: AuthErrorType;
  code: number;
  exception_context: {
    u2f?: {
      payload: CredentialRequestOptionsJSON["publicKey"];
    };
  };
  verified: boolean;
  id: string;
}

export interface AuthApiError {
  message: string;
  error: AuthErrorType;
  code: number;
  exception_context: { [key: string]: any };
}

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
