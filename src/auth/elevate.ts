import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { AUTH_LOADER_ID } from "./loader";
import { ElevateToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";
import { ThunkCtx, thunks } from "@app/api";
import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

export const elevate = thunks.create<ElevateToken>(
  "elevate",
  function* onElevate(ctx: ThunkCtx<ElevateToken>, next) {
    const id = ctx.key;
    yield* put(setLoaderStart({ id }));
    const tokenCtx = yield* call(elevateToken.run, elevateToken(ctx.payload));

    if (!tokenCtx.json.ok) {
      const { message, error, code, exception_context } = tokenCtx.json.data;
      yield* put(
        setLoaderError({
          id,
          message,
          meta: { error, code, exception_context },
        }),
      );
      return;
    }

    yield* put(setLoaderSuccess({ id }));
    yield* next();
  },
);

export const elevateWebauthn = thunks.create<
  ElevateToken & {
    webauthn?: CredentialRequestOptionsJSON["publicKey"] & {
      challenge: string;
    };
  }
>("elevate-webauthn", function* (ctx, next) {
  const { webauthn, ...props } = ctx.payload;
  if (!webauthn) {
    return;
  }

  try {
    const u2f = yield* call(webauthnGet, webauthn);
    yield* call(elevate.run, elevate({ ...props, u2f }));
    yield* next();
  } catch (err) {
    yield put(
      setLoaderError({
        id: AUTH_LOADER_ID,
        message: (err as Error).message,
        // auth loader type sets this expectation
        meta: { exception_context: { u2f: webauthn } },
      }),
    );
  }
});
