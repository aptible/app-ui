import { call, select, put, takeEvery } from 'redux-saga/effects';
import { createAction, Action, MapEntity } from 'robodux';

import { api, ApiCtx } from '@app/api';
import { Token, User } from '@app/types';
import { selectToken } from '@app/token';

import { UserResponse, UsersResponse } from './types';
import { deserializeUser } from './serializers';
import { setCurrentUser, setUsers } from './slice';

export const fetchCurrentUser = api.get(
  'fetch-current-user',
  function* (ctx: ApiCtx<UserResponse>, next) {
    const token: Token = yield select(selectToken);
    if (!token) return;

    ctx.request = {
      url: token.userUrl,
      endpoint: 'auth',
    };

    yield next();

    if (!ctx.response.ok) return;

    const user = deserializeUser(ctx.response.data);
    yield put(setCurrentUser(user));
  },
);

export const fetchUsers = api.get<{ orgId: string }>(
  '/organizations/:orgId/users',
  function* (ctx: ApiCtx<UsersResponse>, next) {
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
