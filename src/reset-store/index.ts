import { Action, Reducer } from 'redux';
import { createAction } from 'robodux';
import { PersistConfig } from 'redux-persist';
import { take, put } from 'redux-saga/effects';

import { AppState } from '@app/types';
import { resetToken } from '@app/token';
import { REDIRECT_NAME } from '@app/redirect-path';
import { LOADERS_NAME } from '@app/loaders';
import { ENTITIES_NAME } from '@app/hal';

export const resetStore = createAction('RESET_STORE');

const WHITELIST: (keyof AppState)[] = [
  REDIRECT_NAME,
  LOADERS_NAME,
  ENTITIES_NAME,
];
const keepState = (
  state: AppState | undefined,
): Partial<AppState> | undefined => {
  if (!state) {
    return state;
  }

  return WHITELIST.reduce<Partial<AppState>>((acc, slice) => {
    (acc as any)[slice] = state[slice];
    return acc;
  }, {});
};

export const resetReducer =
  (rootReducer: Reducer, persistConfig: PersistConfig<any>) =>
  (state: AppState | undefined, action: Action<any>) => {
    if (action.type === `${resetStore}`) {
      const { storage, key } = persistConfig;
      storage.removeItem(`persist:${key}`);

      const nextState = keepState(state);

      return rootReducer(nextState, action);
    }

    return rootReducer(state, action);
  };

function* watchResetToken() {
  while (true) {
    yield take(`${resetToken}`);
    yield put(resetStore());
  }
}

export const sagas = { watchResetToken };
