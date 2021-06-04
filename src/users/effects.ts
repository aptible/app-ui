import { select } from 'redux-saga/effects';

import { authApi, AuthApiCtx } from '@app/api';
import { ApiGen } from '@app/types';
import { selectOrigin } from '@app/env';

import { UserResponse, CreateUserForm } from './types';

export const fetchUsers = authApi.get<{ orgId: string }>(
  '/organizations/:orgId/users',
);

export type CreateUserCtx = AuthApiCtx<UserResponse, CreateUserForm>;
export const createUser = authApi.post<CreateUserForm>(
  '/users',
  function* onCreateUser(ctx: CreateUserCtx, next): ApiGen {
    const origin = yield select(selectOrigin);
    ctx.request = {
      body: JSON.stringify({ ...ctx.payload.options, origin }),
    };

    yield next();
  },
);
