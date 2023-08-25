import { authApi } from "@app/api";
import { delay, leading, put, setLoaderSuccess } from "@app/fx";
import { AuthApiCtx } from "@app/types";
import { patchUsers } from "@app/users";

import { AUTH_LOADER_ID } from "./loader";

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
    // we need to add a delay because for some reason we are getting
    // a race issue where we are calling `fetchUsers()` and the response
    // has stale information for the current user.  So even though
    // the user should be verified, the API returns `false` which means
    // our redirect logic gets borked and keeps the user on the verify
    // page.
    yield* delay(250);
    ctx.actions.push(setLoaderSuccess({ id: AUTH_LOADER_ID }));
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
