import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

import { ThunkCtx, thunks } from "@app/api";
import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { defaultAuthLoaderMeta } from "./loader";
import { ElevateToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";

export const elevate = thunks.create<ElevateToken>(
  "elevate",
  function* onElevate(ctx: ThunkCtx<ElevateToken>, next) {
    // use ctx.name not ctx.key (this is important for webauthn!)
    const id = ctx.name;
    yield* put(setLoaderStart({ id }));
    const tokenCtx = yield* call(() =>
      elevateToken.run(elevateToken(ctx.payload)),
    );

    if (!tokenCtx.json.ok) {
      const { message, error, code, exception_context } = tokenCtx.json
        .data as any;
      yield* put(
        setLoaderError({
          id,
          message,
          meta: defaultAuthLoaderMeta({ error, code, exception_context }),
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
    webauthn?: {
      payload: CredentialRequestOptionsJSON["publicKey"];
    };
  }
>("elevate-webauthn", function* (ctx, next) {
  const { webauthn, ...props } = ctx.payload;
  if (!webauthn) {
    return;
  }
  const id = ctx.key;
  yield* put(setLoaderStart({ id }));

  try {
    const u2f = yield* call(() => webauthnGet(webauthn.payload));
    yield* call(() => elevate.run(elevate({ ...props, u2f })));
    yield* next();
    yield* put(setLoaderSuccess({ id }));
  } catch (err) {
    yield* put(
      setLoaderError({
        id,
        message: (err as Error).message,
        // auth loader type sets this expectation
        meta: defaultAuthLoaderMeta({ exception_context: { u2f: webauthn } }),
      }),
    );
  }
});
