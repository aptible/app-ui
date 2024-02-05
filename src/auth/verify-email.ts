import { authApi } from "@app/api";
import { leading } from "@app/fx";
import { schema } from "@app/schema";
import { AuthApiCtx, HalEmbedded } from "@app/types";

interface VerifyEmail {
  userId: string;
  challengeId: string;
  verificationCode: string;
}

export const verifyEmail = authApi.post<VerifyEmail>(
  "/verifications",
  { supervisor: leading },
  function* onVerifyEmail(ctx: AuthApiCtx<any, VerifyEmail>, next) {
    const { challengeId, verificationCode, userId } = ctx.payload;
    ctx.elevated = true;
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

    yield* schema.update(
      schema.users.patch({ [userId]: { id: userId, verified: true } }),
    );
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

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Success! You should receive an email shortly." };
  },
);

interface EmailVerificationChallenge {
  email: string;
  expires_at: string;
  id: string;
}

export const fetchEmailVerificationPending = authApi.get<
  { userId: string },
  HalEmbedded<{ email_verification_challenges: EmailVerificationChallenge[] }>
>(
  "/users/:userId/email_verification_challenges",
  function* onResendVerification(ctx, next) {
    ctx.elevated = true;
    ctx.cache = true;
    yield* next();
  },
);

export const revokeEmailVerification = authApi.delete<{ id: string }>(
  "/email_verification_challenges/:id",
  function* (ctx, next) {
    ctx.elevated = true;
    yield* next();
  },
);
