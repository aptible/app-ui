import { type ThunkCtx, thunks } from "@app/api";
import { call } from "@app/fx";
import { schema } from "@app/schema";
import type { CredentialRequestOptionsJSON } from "@github/webauthn-json";
import { defaultAuthLoaderMeta } from "./loader";
import { type ElevateToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";

export const elevate = thunks.create<ElevateToken>(
  "elevate",
  function* onElevate(ctx: ThunkCtx<ElevateToken>, next) {
    // use ctx.name not ctx.key (this is important for webauthn!)
    const id = ctx.name;
    yield* schema.update(schema.loaders.start({ id }));
    const tokenCtx = yield* call(() =>
      elevateToken.run(elevateToken(ctx.payload)),
    );

    if (!tokenCtx.json.ok) {
      const { message, error, code, exception_context } = tokenCtx.json.error;
      yield* schema.update(
        schema.loaders.error({
          id,
          message,
          meta: defaultAuthLoaderMeta({
            error,
            code,
            exception_context,
          }) as any,
        }),
      );
      return;
    }

    yield* schema.update(schema.loaders.success({ id }));
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
  yield* schema.update(schema.loaders.start({ id }));

  try {
    const u2f = yield* call(() => webauthnGet(webauthn.payload));
    yield* call(() => elevate.run(elevate({ ...props, u2f })));
    yield* next();
    yield* schema.update(schema.loaders.success({ id }));
  } catch (err) {
    yield* schema.update(
      schema.loaders.error({
        id,
        message: (err as Error).message,
        // auth loader type sets this expectation
        meta: defaultAuthLoaderMeta({
          exception_context: { u2f: webauthn },
        }) as any,
      }),
    );
  }
});
