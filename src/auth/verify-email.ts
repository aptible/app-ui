import { AuthApiCtx, authApi } from "@app/api";

interface VerifyEmail {
  challengeId: string;
  verificationCode: string;
}

export const verifyEmail = authApi.post<VerifyEmail>(
  "/verifications",
  function* onVerifyEmail(ctx: AuthApiCtx<any, VerifyEmail>, next) {
    const { challengeId, verificationCode } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "email_verification_challenge",
        challenge_id: challengeId,
        verification_code: verificationCode,
      }),
    });
    yield next();
  },
);

interface ResendVerification {
  userId: string;
  origin: string;
}

export const resendVerification = authApi.post<ResendVerification>(
  "/users/:userId/email_verification_challenge",
  function* onResendVerification(
    ctx: AuthApiCtx<any, ResendVerification>,
    next,
  ) {
    const { origin } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({ origin }),
    });
    yield next();
  },
);
