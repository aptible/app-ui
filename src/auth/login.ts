import { CredentialRequestOptionsJSON } from "@github/webauthn-json";
import {
  batchActions,
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

import { thunks } from "@app/api";
import { fetchInitialData } from "@app/bootup";
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
      const { error, code, exception_context } = tokenCtx.json.data;
      const is_warning = error === "otp_token_required";
      const message = is_warning
        ? "You must enter your 2FA token to continue"
        : tokenCtx.json.data.message;
      yield put(
        setLoaderError({
          id: AUTH_LOADER_ID,
          message,
          meta: { error, is_warning, code, exception_context },
        }),
      );
      return;
    }

    const elevateCtx = yield* call(elevateToken.run, elevateToken(ctx.payload));
    log(elevateCtx);

    yield put(
      batchActions([
        setLoaderSuccess({ id: AUTH_LOADER_ID }),
        fetchInitialData(),
      ]),
    );
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
