import { takeEvery } from 'redux-saga/effects';

import { login, onLogin } from './login';
import { signup, onSignup } from './signup';
import { elevate, onElevate } from './elevate';

export * from './login';
export * from './logout';
export * from './signup';
export * from './validators';
export * from './verify-email';
export * from './token';
export * from './elevate';

function* watchLogin() {
  yield takeEvery(`${login}`, onLogin);
}

function* watchSignup() {
  yield takeEvery(`${signup}`, onSignup);
}

function* watchElevate() {
  yield takeEvery(`${elevate}`, onElevate);
}

export const sagas = {
  watchLogin,
  watchSignup,
  watchElevate,
};
