import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

import { thunks } from "@app/api";
import { createLog } from "@app/debug";

import { AUTH_LOADER_ID } from "./loader";
import { CreateTokenPayload, createToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";

const log = createLog("login");

export const login = thunks.create<CreateTokenPayload>(
  "login",
  function* onLogin(ctx, next) {
    yield put(setLoaderStart({ id: AUTH_LOADER_ID }));
    const tokenCtx = yield* call(createToken.run, createToken(ctx.payload));

    if (!tokenCtx.json.ok) {
      const { error, code, exception_context, message } = tokenCtx.json.data;
      yield put(
        setLoaderError({
          id: AUTH_LOADER_ID,
          message,
          meta: { error, code, exception_context },
        }),
      );
      return;
    }

    const elevateCtx = yield* call(elevateToken.run, elevateToken(ctx.payload));
    log(elevateCtx);

    yield put(setLoaderSuccess({ id: AUTH_LOADER_ID }));
    yield next();
  },
);

export const loginWebauthn = thunks.create<
  CreateTokenPayload & {
    webauthn?: CredentialRequestOptionsJSON["publicKey"] & {
      challenge: string;
    };
  }
>("login-webauthn", function* (ctx, next) {
  const { webauthn, ...props } = ctx.payload;
  if (!webauthn) {
    return;
  }

  try {
    const u2f = yield* call(webauthnGet, webauthn);
    yield* call(login.run, login({ ...props, u2f }));
    yield next();
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
