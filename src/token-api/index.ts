import { call, put } from 'redux-saga/effects';

import { authApi, AuthApiCtx } from '@app/api';
import {
  TokenSuccessResponse,
  deserializeToken,
  setToken,
  resetToken,
} from '@app/token';

export interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
}
export type TokenCtx = AuthApiCtx<TokenSuccessResponse, CreateTokenPayload>;

function saveToken(ctx: AuthApiCtx<TokenSuccessResponse>) {
  if (!ctx.response.ok) return;
  const curToken = deserializeToken(ctx.response.data);
  ctx.actions.push(setToken(curToken));
}

export const fetchCurrentToken = authApi.get(
  '/current_token',
  function* onFetchToken(ctx: AuthApiCtx<TokenSuccessResponse>, next) {
    yield next();
    if (!ctx.response.ok) {
      yield put(resetToken());
      return;
    }
    yield call(saveToken, ctx);
  },
);

export const createToken = authApi.post<CreateTokenPayload>(
  '/tokens',
  function* onCreateToken(ctx: TokenCtx, next) {
    ctx.request = {
      body: JSON.stringify({
        username: ctx.payload.username,
        password: ctx.payload.password,
        otp_token: ctx.payload.otpToken,
        make_current: ctx.payload.makeCurrent,
        expires_in: 43200, // 12 hours
        grant_type: 'password',
        scope: 'manage',
        _source: 'deploy',
      }),
    };

    yield next();
    yield call(saveToken, ctx);
  },
);

interface ExchangeToken {
  accessToken: string;
  userUrl: string;
}

export const exchangeToken = authApi.post<ExchangeToken>(
  'exchange-token',
  function* onExchangeToken(
    ctx: AuthApiCtx<TokenSuccessResponse, ExchangeToken>,
    next,
  ) {
    ctx.request = {
      url: '/tokens',
      method: 'POST',
      body: JSON.stringify({
        expires_in: 86090,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        actor_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        actor_token: ctx.payload.accessToken,
        subject_token_type: 'aptible:user:href',
        subject_token: ctx.payload.userUrl,
        scope: 'manage',
        _source: 'deploy',
      }),
    };

    yield next();
    yield call(saveToken, ctx);
  },
);
