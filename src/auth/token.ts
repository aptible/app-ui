import { call, put } from "saga-query";

import { AuthApiCtx, authApi } from "@app/api";
import {
  TokenSuccessResponse,
  deserializeToken,
  resetToken,
  setElevatedToken,
  setToken,
} from "@app/token";
import { PublicKeyCredentialWithAssertionJSON } from "@github/webauthn-json";

export interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
  u2f?: PublicKeyCredentialWithAssertionJSON;
}
function saveToken(ctx: AuthApiCtx<any, TokenSuccessResponse>) {
  if (!ctx.json.ok) {
    return;
  }
  const curToken = deserializeToken(ctx.json.data);
  ctx.actions.push(setToken(curToken));
}

export const fetchCurrentToken = authApi.get<never, TokenSuccessResponse>(
  "/current_token",
  function* onFetchToken(ctx, next) {
    ctx.noToken = true;
    yield next();
    if (!ctx.json.ok) {
      yield put(resetToken());
      return;
    }
    yield call(saveToken, ctx);
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
      make_current: ctx.payload.makeCurrent,
      u2f: ctx.payload.u2f,
      expires_in: 43200, // 12 hours
      grant_type: "password",
      scope: "manage",
      _source: "deploy",
    }),
  });

  yield next();
  yield* call(saveToken, ctx);
});

export type ElevateToken = Omit<CreateTokenPayload, "makeCurrent">;
export type ElevateTokenCtx = AuthApiCtx<TokenSuccessResponse, ElevateToken>;

export const elevateToken = authApi.post<ElevateToken, TokenSuccessResponse>(
  "create-elevated-token",
  function* onElevateToken(ctx, next) {
    ctx.request = ctx.req({
      url: "/tokens",
      method: "POST",
      body: JSON.stringify({
        username: ctx.payload.username,
        password: ctx.payload.password,
        otp_token: ctx.payload.otpToken,
        make_current: false,
        expires_in: 30 * 60, // 30 mins
        grant_type: "password",
        scope: "elevated",
        _source: "deploy",
      }),
    });

    yield next();

    if (!ctx.json.ok) {
      return;
    }
    const curToken = deserializeToken(ctx.json.data);
    ctx.actions.push(setElevatedToken(curToken));
  },
);

interface ExchangeToken {
  accessToken: string;
  userUrl: string;
}

export const exchangeToken = authApi.post<ExchangeToken, TokenSuccessResponse>(
  "exchange-token",
  function* onExchangeToken(ctx, next) {
    ctx.request = ctx.req({
      url: "/tokens",
      method: "POST",
      body: JSON.stringify({
        expires_in: 86090,
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        actor_token_type: "urn:ietf:params:oauth:token-type:jwt",
        actor_token: ctx.payload.accessToken,
        subject_token_type: "aptible:user:href",
        subject_token: ctx.payload.userUrl,
        scope: "manage",
        _source: "deploy",
      }),
    });

    yield next();
    yield* call(saveToken, ctx);
  },
);

export const revokeAllTokens = authApi.post(
  "/tokens/revoke_all_accessible",
  function* onRevokeAll(ctx, next) {
    yield next();
    if (!ctx.json.ok) {
      return;
    }
    ctx.actions.push(resetToken());
  },
);
