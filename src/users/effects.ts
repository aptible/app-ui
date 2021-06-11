import { select } from 'redux-saga/effects';
import { Next } from 'saga-query';

import { authApi, AuthApiCtx } from '@app/api';
import { ApiGen } from '@app/types';
import { selectOrigin } from '@app/env';

import { UserResponse, CreateUserForm } from './types';

interface UserBase {
  userId: string;
}

export const fetchUser = authApi.get<UserBase>(
  '/users/:userId',
  authApi.request({ elevated: true }),
);
export const fetchUsers = authApi.get<{ orgId: string }>(
  '/organizations/:orgId/users',
);

export type CreateUserCtx = AuthApiCtx<UserResponse, CreateUserForm>;
export const createUser = authApi.post<CreateUserForm>(
  '/users',
  function* onCreateUser(ctx: CreateUserCtx, next): ApiGen {
    const origin = yield select(selectOrigin);
    ctx.request = {
      body: JSON.stringify({ ...ctx.payload, origin }),
    };

    yield next();
  },
);

interface UpdatePassword extends UserBase {
  type: 'update-password';
  password: string;
}

interface AddOtp extends UserBase {
  type: 'otp';
  otp_enabled: true;
  current_otp_configuration: string;
  current_otp_configuration_id: string;
  otp_token: string;
}

interface RemoveOtp extends UserBase {
  type: 'otp';
  otp_enabled: false;
}

// This is a discriminated union.
// When we provide a `type` to this payload we can make guarentees about the
// we require in order to perform the update.
type PatchUser = UpdatePassword | AddOtp | RemoveOtp;

type ElevatedPostCtx = AuthApiCtx<
  any,
  { userId: string; [key: string]: string | number | boolean }
>;

function* elevatedUpdate(ctx: ElevatedPostCtx, next: Next) {
  const { userId, type: _, ...payload } = ctx.payload;
  ctx.request = {
    elevated: true,
    body: JSON.stringify(payload),
  };
  yield next();
}

export const updateUser = authApi.patch<PatchUser>(
  '/users/:userId',
  elevatedUpdate,
);

interface UpdateEmail {
  userId: string;
  email: string;
}

export const updateEmail = authApi.post<UpdateEmail>(
  '/:userId/email_verification_challenges',
  elevatedUpdate,
);

export const fetchRecoveryCodes = authApi.get<UserBase>(
  '/users/:userId/otp_recovery_codes',
  authApi.request({ quickSave: true }),
);
