import { takeEvery } from 'redux-saga/effects';

import { login, onLogin } from './login';
import { signup, onSignup } from './signup';

export * from './login';
export * from './logout';
export * from './signup';
export * from './validators';
export * from './verify-email';
export * from './token';

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
