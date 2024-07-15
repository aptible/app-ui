import { authApi, thunks } from "@app/api";
import { selectEnv } from "@app/config";
import { type Next, put, select } from "@app/fx";
import { resetStore } from "@app/reset-store";
import { schema } from "@app/schema";
import {
  type TokenSuccessResponse,
  deserializeToken,
  selectToken,
} from "@app/token";
import { tunaEvent, tunaIdentify } from "@app/tuna";
import type { AuthApiCtx, Token } from "@app/types";
import type { PublicKeyCredentialWithAssertionJSON } from "@github/webauthn-json";

const setToken = thunks.create<Token>("set-token", function* (ctx, next) {
  yield* schema.update(schema.token.set(ctx.payload));
  yield* next();
});

export interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  u2f?: PublicKeyCredentialWithAssertionJSON;
}
function* saveToken(ctx: AuthApiCtx<any, TokenSuccessResponse>) {
  if (!ctx.json.ok) {
    return;
  }
  const curToken = deserializeToken(ctx.json.value);
  ctx.actions.push(setToken(curToken));
}

export const fetchCurrentToken = authApi.get<never, TokenSuccessResponse>(
  "/current_token",
  function* onFetchToken(ctx, next) {
    ctx.noToken = true;
    yield* next();
    yield* saveToken(ctx);
  },
);

export const createToken = authApi.post<
  CreateTokenPayload,
  TokenSuccessResponse
>("/tokens", function* onCreateToken(ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      username: ctx.payload.username,
      password: ctx.payload.password,
      otp_token: ctx.payload.otpToken,
      u2f: ctx.payload.u2f,
      expires_in: 43200, // 12 hours
      grant_type: "password",
      scope: "manage",
      _source: "deploy",
    }),
  });

  yield* next();
  if (ctx.json.ok) {
    tunaIdentify(ctx.payload.username);
  }
  yield* saveToken(ctx);
});

export type ElevateToken = CreateTokenPayload;

export const elevateToken = authApi.post<ElevateToken, TokenSuccessResponse>(
  "create-elevated-token",
  function* onElevateToken(ctx, next) {
    ctx.credentials = "omit";
    ctx.request = ctx.req({
      url: "/tokens",
      method: "POST",
      body: JSON.stringify({
        username: ctx.payload.username,
        password: ctx.payload.password,
        otp_token: ctx.payload.otpToken,
        u2f: ctx.payload.u2f,
        expires_in: 30 * 60, // 30 mins
        grant_type: "password",
        scope: "elevated",
        _source: "deploy",
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    tunaEvent("elevated-token", ctx.payload.username);
    const curToken = deserializeToken(ctx.json.value);
    yield* schema.update(schema.elevatedToken.set(curToken));
  },
);

export interface ExchangeToken {
  actorToken: string;
  subjectToken: string;
  subjectTokenType: string;
  scope: string;
  ssoOrganization?: string;
}

export const exchangeToken = authApi.post<ExchangeToken, TokenSuccessResponse>(
  "exchange-token",
  function* onExchangeToken(ctx, next) {
    const {
      actorToken,
      subjectToken,
      subjectTokenType,
      scope,
      ssoOrganization = "",
    } = ctx.payload;
    ctx.request = ctx.req({
      url: "/tokens",
      method: "POST",
      body: JSON.stringify({
        expires_in: 86090,
        _source: "app-ui",
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        actor_token_type: "urn:ietf:params:oauth:token-type:jwt",
        actor_token: actorToken,
        subject_token_type: subjectTokenType,
        subject_token: subjectToken,
        scope: scope,
        sso_organization: ssoOrganization,
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }
    // `exchangeToken` is used when a new user creates an org as well as when
    // a user impersonates another user.
    // Regardless, we want to reset the store first then save the token because
    // resetStore will delete the token stored inside redux.
    const curToken = deserializeToken(ctx.json.value);
    yield* put([resetStore(), setToken(curToken), { type: "REFRESH_DATA" }]);
    ctx.loader = { message: "Success" };
    tunaEvent("exchanged-token", ctx.payload);
  },
);

export const revokeAllTokens = authApi.post(
  "/tokens/revoke_all_accessible",
  function* onRevokeAll(ctx, next) {
    ctx.elevated = true;
    const env = yield* select(selectEnv);
    const token = yield* select(selectToken);
    const elevated = yield* select(schema.elevatedToken.select);
    ctx.request = ctx.req({
      body: JSON.stringify({
        except_tokens: [
          `${env.authUrl}/tokens/${token.tokenId}`,
          `${env.authUrl}/tokens/${elevated.tokenId}`,
        ],
      }),
    });
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    tunaEvent("revoked-all-tokens");
    ctx.loader = {
      message:
        "Successfully logged out of other sessions! You may wish to log out of this session, as well.",
     };
   },
  );

export function* revokeTokensMdw(ctx: AuthApiCtx, next: Next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  yield* revokeAllTokens.run();
  const msg = ctx.loader?.message || "Success!";
  ctx.loader = { message: `${msg} Other sessions have been logged out.` };
}
