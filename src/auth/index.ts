import { put, select, takeEvery } from 'redux-saga/effects';
import { batchActions } from 'redux-batched-actions';
import { ActionWithPayload, createAction } from 'robodux';
import { createQuery } from 'saga-query';

import { authApi, AuthApiCtx } from '@app/api';
import { Token } from '@app/types';
import { resetToken, setToken, selectToken } from '@app/token';
import {
  resetCurrentUser,
  setCurrentUser,
  defaultUser,
  CreateUserForm,
  CreateUserCtx,
  createUser,
} from '@app/users';
import {
  setAuthLoaderStart,
  setAuthLoaderError,
  setAuthLoaderSuccess,
} from '@app/loaders';

import { parseJwt } from './jwt-parser';

export * from './validators';

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

export const fetchCurrentToken = authApi.get('/current_token');

export const logout = authApi.delete(
  `/tokens/:tokenId`,
  function* onLogout(ctx, next) {
    const token: Token = yield select(selectToken);
    ctx.request = {
      url: `/tokens/${token.tokenId}`,
    };

    yield next();

    if (!ctx.response.ok) return;

    yield put(batchActions([resetToken(), resetCurrentUser()]));
  },
);

interface CreateTokenPayload {
  username: string;
  password: string;
  otpToken: string;
  makeCurrent: boolean;
}

type TokenCtx = AuthApiCtx<TokenSuccessResponse, CreateTokenPayload>;
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

    console.log(ctx.response);
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
      ]),
    );
  },
);

export const loginSuccess = createAction('LOGIN_SUCCESS');
export const login = createAction<CreateTokenPayload>('LOGIN');
export function* onLogin(action: ActionWithPayload<CreateTokenPayload>) {
  yield put(setAuthLoaderStart());
  const ctx: TokenCtx = yield createToken.run(action.payload);
  console.log(ctx);

  if (!ctx.response.ok) {
    yield put(
      setAuthLoaderError({
        message: ctx.response.data,
      }),
    );
    return;
  }

  yield put(batchActions([setAuthLoaderSuccess(), loginSuccess()]));
}

export const signupSuccess = createAction('SIGNUP_SUCCESS');
export const signup = createAction<CreateUserForm>('SIGNUP');
export function* onSignup(action: ActionWithPayload<CreateUserForm>) {
  const { email, password } = action.payload;
  yield put(setAuthLoaderStart());

  const userCtx: CreateUserCtx = yield createUser.run(action.payload);
  console.log(userCtx);
  if (!userCtx.response.ok) {
    yield put(
      setAuthLoaderError({
        message: userCtx.response.data,
      }),
    );
    return;
  }

  const tokenCtx: TokenCtx = yield createToken.run({
    username: email,
    password,
    otpToken: '',
    makeCurrent: true,
  });
  console.log(tokenCtx);
  if (!tokenCtx.response.ok) {
    yield put(
      setAuthLoaderError({
        message: tokenCtx.response.data,
      }),
    );
    return;
  }

  yield put(batchActions([setAuthLoaderSuccess(), signupSuccess()]));
}

function* watchLogin() {
  yield takeEvery(`${login}`, onLogin);
}

function* watchSignup() {
  yield takeEvery(`${signup}`, onSignup);
}

export const sagas = {
  watchLogin,
  watchSignup,
};
