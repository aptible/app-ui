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
    const { message, error, code, exception_context } = userCtx.response.data;
    yield put(
      setAuthLoaderError({
        message,
        meta: {
          error,
          code,
          exception_context,
        },
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
    const { message, error, code, exception_context } = tokenCtx.response.data;
    yield put(
      setAuthLoaderError({
        message,
        meta: {
          error,
          code,
          exception_context,
        },
      }),
    );
    return;
  }

  yield put(batchActions([setAuthLoaderSuccess(), signupSuccess()]));
}
