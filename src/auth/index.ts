import { takeEvery } from 'redux-saga/effects';

import { login, onLogin } from './login';
import { signup, onSignup } from './signup';

// 800-338-0178 option 2

export * from './login';
export * from './logout';
export * from './signup';
export * from './validators';

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
