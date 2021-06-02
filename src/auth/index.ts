import { put, select } from 'redux-saga/effects';
import { batchActions } from 'redux-batched-actions';

import { Token } from '@app/types';
import { api, ApiCtx } from '@app/api';
import { resetToken, setToken, selectToken } from '@app/token';
import { resetCurrentUser, setCurrentUser, defaultUser } from '@app/users';
import { setAuthLoaderSuccess } from '@app/loaders';

import { parseJwt } from './jwt-parser';

interface TokenSuccessResponse {
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

interface JWTTokenResponse {
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

export function deserializeToken(t: TokenSuccessResponse): Token {
  const actorUrl = t._links.actor ? t._links.actor.href : t._links.user.href;
  return {
    tokenId: t.id,
    accessToken: t.access_token,
    userUrl: t._links.user.href,
    actorUrl,
  };
}

export const fetchCurrentToken = api.get(
  '/current_token',
  api.request({ endpoint: 'auth' }),
);

export const logout = api.delete(
  `/tokens/:tokenId`,
  function* onLogout(ctx, next) {
    const token: Token = yield select(selectToken);
    ctx.request = {
      endpoint: 'auth',
      url: `/tokens/${token.tokenId}`,
    };

    yield next();

    if (!ctx.response.ok) return;

    yield put(batchActions([resetToken(), resetCurrentUser()]));
  },
);

interface LoginPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
}

export const login = api.post<LoginPayload>(
  '/tokens',
  function* onLogin(
    ctx: ApiCtx<TokenSuccessResponse, any, LoginPayload>,
    next,
  ) {
    ctx.request = {
      endpoint: 'auth',
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

    const resp = ctx.response.data;
    const token = deserializeToken(resp);
    const userInfo: JWTTokenResponse = parseJwt(token.accessToken);

    yield put(
      batchActions([
        setToken(token),
        setCurrentUser(
          defaultUser({
            id: userInfo.sub ? userInfo.sub.split('/').pop() : '',
            name: userInfo.name,
            email: userInfo.email,
            verified: userInfo.email_verified,
          }),
        ),
        setAuthLoaderSuccess(),
      ]),
    );
  },
);
