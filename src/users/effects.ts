import { select, put } from 'redux-saga/effects';
import { MapEntity } from 'robodux';

import { authApi, AuthApiCtx } from '@app/api';
import { Token, User, ApiGen } from '@app/types';
import { selectToken } from '@app/token';
import { selectOrigin } from '@app/env';

import { UserResponse, UsersResponse, CreateUserForm } from './types';
import { deserializeUser } from './serializers';
import { setCurrentUser, setUsers } from './slice';

export const fetchCurrentUser = authApi.get(
  'fetch-current-user',
  function* onFetchCurrentUser(ctx: AuthApiCtx<UserResponse>, next) {
    const token: Token = yield select(selectToken);
    if (!token) return;

    ctx.request = {
      url: token.userUrl,
    };

    yield next();

    if (!ctx.response.ok) return;

    const user = deserializeUser(ctx.response.data);
    yield put(setCurrentUser(user));
  },
);

export const fetchUsers = authApi.get<{ orgId: string }>(
  '/organizations/:orgId/users',
  function* onFetchUsers(ctx: AuthApiCtx<UsersResponse>, next) {
    yield next();

    if (!ctx.response.ok) return;

    const { users } = ctx.response.data._embedded;

    const usersMap = users.reduce<MapEntity<User>>((acc, user) => {
      acc[user.id] = deserializeUser(user);
      return acc;
    }, {});

    yield put(setUsers(usersMap));
  },
);

export type CreateUserCtx = AuthApiCtx<UserResponse, CreateUserForm>;
export const createUser = authApi.post<CreateUserForm>(
  '/users',
  function* onCreateUser(ctx: CreateUserCtx, next): ApiGen {
    const origin = yield select(selectOrigin);
    ctx.request = {
      body: JSON.stringify({ ...ctx.payload.options, origin }),
    };

    if (!ctx.response.ok) return;

    yield put(setCurrentUser(deserializeUser(ctx.response.data)));
  },
);
