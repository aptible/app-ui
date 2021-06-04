import { call, put } from 'redux-saga/effects';
import { createAssign, createReducerMap } from 'robodux';

import { selectAuthLoader } from '@app/loaders';
import { Token, AppState } from '@app/types';
import { authApi, AuthApiCtx } from '@app/api';

export * from './jwt-parser';

export interface TokenSuccessResponse {
  access_token: string;
  created_at: string;
  expires_at: string;
  expires_in: string;
  id: string;
  scope: string;
  token_type: string;
  _links: {
    self: {
      href: string;
    };
    user: {
      href: string;
    };
    actor?: { href: string } | null;
  };
  _type: 'token';
}

export interface JWTTokenResponse {
  id: string;
  iss: string;
  sub: string;
  scope: string;
  exp: string;
  session: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export const defaultToken = (t: Partial<Token> = {}): Token => {
  return {
    tokenId: '',
    accessToken: '',
    userUrl: '',
    actorUrl: '',
    ...t,
  };
};

export function deserializeToken(t: TokenSuccessResponse): Token {
  const actorUrl = t._links.actor ? t._links.actor.href : t._links.user.href;
  return {
    tokenId: t.id,
    accessToken: t.access_token,
    userUrl: t._links.user.href,
    actorUrl,
  };
}

export const TOKEN_SLICE = 'token';
const token = createAssign({
  name: TOKEN_SLICE,
  initialState: defaultToken(),
});

export const { set: setToken, reset: resetToken } = token.actions;

export const reducers = createReducerMap(token);

export const selectToken = (state: AppState) => state[TOKEN_SLICE];
export const selectAccessToken = (state: AppState) =>
  selectToken(state).accessToken;
export const selectActorUrl = (state: AppState) => selectToken(state).actorUrl;
export const selectUserUrl = (state: AppState) => selectToken(state).userUrl;
export const selectIsImpersonated = (state: AppState) =>
  selectActorUrl(state) !== selectUserUrl(state);
export const selectIsUserAuthenticated = (state: AppState) =>
  !!selectAccessToken(state);

export const selectIsOtpError = (state: AppState) =>
  selectAuthLoader(state).message.error === 'otp_token_required';

export const selectIsAuthenticationError = (state: AppState) => {
  const { error } = selectAuthLoader(state).message;
  return (
    error === 'unprocessable_entity' ||
    error === 'invalid_credentials' ||
    error === 'invalid_email' ||
    error === 'unsupported_grant_type'
  );
};

export interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
}
export type TokenCtx = AuthApiCtx<TokenSuccessResponse, CreateTokenPayload>;

function* saveToken(data: TokenSuccessResponse) {
  const curToken = deserializeToken(data);
  yield put(setToken(curToken));
}

export const fetchCurrentToken = authApi.get(
  '/current_token',
  function* onFetchToken(ctx: AuthApiCtx<TokenSuccessResponse>, next) {
    yield next();
    if (!ctx.response.ok) {
      yield put(resetToken());
      return;
    }
    yield call(saveToken, ctx.response.data);
  },
);

export const createToken = authApi.post<CreateTokenPayload>(
  '/tokens',
  function* onCreateToken(ctx: TokenCtx, next) {
    ctx.request = {
      body: JSON.stringify({
        username: ctx.payload.options.username,
        password: ctx.payload.options.password,
        otp_token: ctx.payload.options.otpToken,
        make_current: ctx.payload.options.makeCurrent,
        expires_in: 43200, // 12 hours
        grant_type: 'password',
        scope: 'manage',
        _source: 'deploy',
      }),
    };

    yield next();
    if (!ctx.response.ok) return;
    yield call(saveToken, ctx.response.data);
  },
);
