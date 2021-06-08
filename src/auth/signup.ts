import { put, call } from 'redux-saga/effects';
import { ActionWithPayload, createAction } from 'robodux';
import { batchActions } from 'redux-batched-actions';

import { AuthApiCtx } from '@app/api';
import {
  setAuthLoaderStart,
  setAuthLoaderError,
  setAuthLoaderSuccess,
} from '@app/loaders';
import { CreateUserForm, CreateUserCtx, createUser } from '@app/users';

import { TokenCtx, createToken } from './token';

function* setAuthError(ctx: AuthApiCtx) {
  if (ctx.response.ok) return;
  const { message, ...meta } = ctx.response.data;
  yield put(setAuthLoaderError({ message, meta }));
}

export const signupSuccess = createAction('SIGNUP_SUCCESS');
export const signup = createAction<CreateUserForm>('SIGNUP');
export function* onSignup(action: ActionWithPayload<CreateUserForm>) {
  const { email, password } = action.payload;
  yield put(setAuthLoaderStart());

  const userCtx: CreateUserCtx = yield call(
    createUser.run,
    createUser(action.payload),
  );
  console.log(userCtx);
  if (!userCtx.response.ok) {
    yield call(setAuthError, userCtx);
    return;
  }

  const tokenCtx: TokenCtx = yield call(
    createToken.run,
    createToken({
      username: email,
      password,
      otpToken: '',
      makeCurrent: true,
    }),
  );
  console.log(tokenCtx);
  if (!tokenCtx.response.ok) {
    yield call(setAuthError, tokenCtx);
    return;
  }

  yield put(batchActions([setAuthLoaderSuccess(), signupSuccess()]));
}
