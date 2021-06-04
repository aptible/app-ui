import { put } from 'redux-saga/effects';
import { ActionWithPayload, createAction } from 'robodux';
import { batchActions } from 'redux-batched-actions';

import {
  setAuthLoaderStart,
  setAuthLoaderError,
  setAuthLoaderSuccess,
} from '@app/loaders';
import { CreateUserForm, CreateUserCtx, createUser } from '@app/users';
import { TokenCtx, createToken } from '@app/token';

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
