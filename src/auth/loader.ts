import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

export interface AuthLoaderMeta {
  error: string;
  code: number;
  exception_context: {
    u2f?: {
      payload: CredentialRequestOptionsJSON["publicKey"] & {
        challenge: string;
      };
    };
  };
  verified: boolean;
  id: string;
}

export const AUTH_LOADER_ID = "auth";

export const isOtpError = (error: string) => error === "otp_token_required";

export const isAuthenticationError = (error: string) => {
  return (
    error === "unprocessable_entity" ||
    error === "invalid_credentials" ||
    error === "invalid_email" ||
    error === "unsupported_grant_type" ||
    error === "access_denied" ||
    error === "invalid_scope"
  );
};

export const defaultAuthLoaderMeta = (
  p: Partial<AuthLoaderMeta>,
): AuthLoaderMeta => {
  return {
    error: "",
    code: 0,
    exception_context: { ...p.exception_context },
    verified: false,
    id: "",
    ...p,
  };
};
