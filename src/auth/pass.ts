import { select } from "@app/fx";

import { authApi } from "@app/api";
import { selectOrigin } from "@app/env";

export const forgotPass = authApi.post<{ email: string }>(
  "/password/resets/new",
  function* (ctx, next) {
    const email = ctx.payload.email;
    const origin = yield* select(selectOrigin);
    if (!origin || !email) {
      return;
    }

    ctx.request = ctx.req({
      body: JSON.stringify({
        email,
        origin,
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      ctx.loader = {
        message: `Error! Unable to submit request to reset your password: ${ctx.json.data.message}
        `,
      };
      return;
    }

    ctx.loader = {
      message: "Success! Check your email to change your password.",
    };
  },
);

interface ResetPass {
  challengeId: string;
  password: string;
  verificationCode: string;
}

export const resetPass = authApi.post<ResetPass>(
  ["/verifications", "pass"],
  function* (ctx, next) {
    const { challengeId, password, verificationCode } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "password_reset_challenge",
        challenge_id: challengeId,
        password: password,
        verification_code: verificationCode,
      }),
    });

    yield* next();
  },
);
