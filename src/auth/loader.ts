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
