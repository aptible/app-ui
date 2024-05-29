import { thunks } from "@app/api";
import { createLog } from "@app/debug";
import { call } from "@app/fx";
import { schema } from "@app/schema";
import type { CredentialRequestOptionsJSON } from "@github/webauthn-json";
import { AUTH_LOADER_ID, defaultAuthLoaderMeta } from "./loader";
import { type CreateTokenPayload, createToken, elevateToken } from "./token";
import { webauthnGet } from "./webauthn";

const log = createLog("login");

export const login = thunks.create<CreateTokenPayload>(
  "login",
  function* onLogin(ctx, next) {
    // use ctx.name not ctx.key (this is important for webauthn!)
    const id = ctx.name;
    yield* schema.update(schema.loaders.start({ id }));
    const tokenCtx = yield* call(() =>
      createToken.run(createToken(ctx.payload)),
    );

    if (!tokenCtx.json.ok) {
      const { error, code, exception_context, message } = tokenCtx.json
        .error as any;
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

    // only elevate token if it's a normal password login, otp/u2f won't work
    if (!ctx.payload.u2f && ctx.payload.otpToken === "") {
      const elevateCtx = yield* call(() =>
        elevateToken.run(elevateToken(ctx.payload)),
      );
      log(elevateCtx);
    }

    yield* next();

    ctx.actions.push({ type: "REFRESH_DATA" });
    yield* schema.update([
      schema.loaders.success({ id }),
      schema.loaders.success({ id: AUTH_LOADER_ID }),
    ]);
  },
);

export const loginWebauthn = thunks.create<
  CreateTokenPayload & {
    webauthn?: {
      payload: CredentialRequestOptionsJSON["publicKey"];
    };
  }
>("login-webauthn", function* (ctx, next) {
  const id = ctx.key;
  const { webauthn, ...props } = ctx.payload;
  if (!webauthn) {
    return;
  }

  try {
    const u2f = yield* call(() => webauthnGet(webauthn.payload));
    yield* call(() => login.run(login({ ...props, u2f })));
    yield* next();
  } catch (err) {
    console.error(err);
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
