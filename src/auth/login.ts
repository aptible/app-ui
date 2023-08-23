import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

import { thunks } from "@app/api";
import { createLog } from "@app/debug";
import {
  batchActions,
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { AUTH_LOADER_ID, defaultAuthLoaderMeta } from "./loader";
import { CreateTokenPayload, createToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";

const log = createLog("login");

export const login = thunks.create<CreateTokenPayload>(
  "login",
  function* onLogin(ctx, next) {
    const id = ctx.key;
    yield* put(setLoaderStart({ id }));
    const tokenCtx = yield* call(createToken.run, createToken(ctx.payload));

    if (!tokenCtx.json.ok) {
      const { error, code, exception_context, message } = tokenCtx.json.data;
      yield* put(
        setLoaderError({
          id,
          message,
          meta: defaultAuthLoaderMeta({ error, code, exception_context }),
        }),
      );
      return;
    }

    const elevateCtx = yield* call(elevateToken.run, elevateToken(ctx.payload));
    log(elevateCtx);

    yield* next();

    yield* put(
      batchActions([
        setLoaderSuccess({ id }),
        setLoaderSuccess({ id: AUTH_LOADER_ID }),
      ]),
    );
  },
);

export const loginWebauthn = thunks.create<
  CreateTokenPayload & {
    webauthn?: {
      payload: CredentialRequestOptionsJSON["publicKey"] & {
        challenge: string;
      };
    };
  }
>("login-webauthn", function* (ctx, next) {
  const id = ctx.key;
  const { webauthn, ...props } = ctx.payload;
  if (!webauthn) {
    return;
  }

  try {
    const u2f = yield* call(webauthnGet, webauthn.payload);
    yield* call(login.run, login({ ...props, u2f }));
    yield* next();
  } catch (err) {
    yield put(
      setLoaderError({
        id,
        message: (err as Error).message,
        // auth loader type sets this expectation
        meta: defaultAuthLoaderMeta({ exception_context: { u2f: webauthn } }),
      }),
    );
  }
});
