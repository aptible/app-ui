import { authApi } from "@app/api";
import { leading, put } from "@app/fx";
import { AuthApiCtx } from "@app/types";
import { patchUsers } from "@app/users";

interface VerifyEmail {
  userId: string;
  challengeId: string;
  verificationCode: string;
}

export const verifyEmail = authApi.post<VerifyEmail>(
  "/verifications",
  { saga: leading },
  function* onVerifyEmail(ctx: AuthApiCtx<any, VerifyEmail>, next) {
    const { challengeId, verificationCode, userId } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "email_verification_challenge",
        challenge_id: challengeId,
        verification_code: verificationCode,
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* put(patchUsers({ [userId]: { id: userId, verified: true } }));
  },
);

interface ResendVerification {
  userId: string;
  origin: string;
}

export const resendVerification = authApi.post<ResendVerification>(
  "/users/:userId/email_verification_challenges",
  function* onResendVerification(ctx, next) {
    const { origin } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({ origin }),
    });
    yield* next();
  },
);
