import { call, put } from "saga-query";

import { authApi, AuthApiCtx } from "@app/api";
import {
  TokenSuccessResponse,
  deserializeToken,
  setToken,
  setElevatedToken,
  resetToken,
} from "@app/token";

export interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
}
export type TokenCtx = AuthApiCtx<TokenSuccessResponse, CreateTokenPayload>;

function saveToken(ctx: AuthApiCtx<TokenSuccessResponse>) {
  if (!ctx.json.ok) {
    return;
  }
  const curToken = deserializeToken(ctx.json.data);
  ctx.actions.push(setToken(curToken));
}

export const fetchCurrentToken = authApi.get(
  "/current_token",
  function* onFetchToken(ctx: AuthApiCtx<TokenSuccessResponse>, next) {
    yield next();
    if (!ctx.json.ok) {
      yield put(resetToken());
      return;
    }
    yield call(saveToken, ctx);
  },
);

export const createToken = authApi.post<CreateTokenPayload>(
  "/tokens",
  function* onCreateToken(ctx: TokenCtx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        username: ctx.payload.username,
        password: ctx.payload.password,
        otp_token: ctx.payload.otpToken,
        make_current: ctx.payload.makeCurrent,
        expires_in: 43200, // 12 hours
        grant_type: "password",
        scope: "manage",
        _source: "deploy",
      }),
    });

    yield next();
    yield call(saveToken, ctx);
  },
);

export type ElevateToken = Omit<CreateTokenPayload, "makeCurrent">;
export type ElevateTokenCtx = AuthApiCtx<TokenSuccessResponse, ElevateToken>;
export const elevateToken = authApi.post<ElevateToken>(
  "create-elevated-token",
  function* onElevateToken(ctx: ElevateTokenCtx, next) {
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

export const exchangeToken = authApi.post<ExchangeToken>(
  "exchange-token",
  function* onExchangeToken(
    ctx: AuthApiCtx<TokenSuccessResponse, ExchangeToken>,
    next,
  ) {
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
    yield call(saveToken, ctx);
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
