import type { AuthErrorType, AuthLoaderMeta } from "@app/types";

export const AUTH_LOADER_ID = "auth";

export const isOtpError = (error: AuthErrorType) =>
  error === "otp_token_required";

export const isAuthenticationError = (error: AuthErrorType) => {
  return (
    error === "unprocessable_entity" ||
    error === "invalid_credentials" ||
    error === "invalid_email" ||
    error === "unsupported_grant_type" ||
    error === "access_denied" ||
    error === "invalid_scope" ||
    error === "use_invitation"
  );
};

export const defaultAuthLoaderMeta = (
  p?: Partial<AuthLoaderMeta>,
): AuthLoaderMeta => {
  const context = p?.exception_context || {};
  return {
    error: "",
    code: 0,
    verified: false,
    id: "",
    ...p,
    exception_context: { ...context },
  };
};
