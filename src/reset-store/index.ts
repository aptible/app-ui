import type { Reducer } from "@reduxjs/toolkit";
import type { PersistConfig } from "redux-persist";
import { BATCH, put, select, take } from "saga-query";

import { ENTITIES_NAME } from "@app/hal";
import { REDIRECT_NAME } from "@app/redirect-path";
import { SIGNAL_NAME, selectSignal, setSignal } from "@app/signal";
import { createAction } from "@app/slice-helpers";
import { resetToken } from "@app/token";
import type { Action, AppState } from "@app/types";

export const resetStore = createAction("RESET_STORE");

const ALLOW_LIST: (keyof AppState)[] = [
  REDIRECT_NAME,
  ENTITIES_NAME,
  SIGNAL_NAME,
];

const keepState = (
  state: AppState | undefined,
): Partial<AppState> | undefined => {
  if (!state) {
    return state;
  }

  return ALLOW_LIST.reduce<Partial<AppState>>((acc, slice) => {
    (acc as any)[slice] = state[slice];
    return acc;
  }, {});
};

export const resetReducer =
  (rootReducer: Reducer, persistConfig: PersistConfig<any>) =>
  (state: AppState | undefined, action: Action<any>) => {
    let reset = false;
    if (action.type === BATCH) {
      const actions = (action as any).payload as Action[];
      actions.forEach((act) => {
        if (act.type === `${resetStore}`) {
          reset = true;
        }
      });
    } else if (action.type === `${resetStore}`) {
      reset = true;
    }

    if (reset) {
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

function* watchSignal() {
  while (true) {
    yield* take(`${resetStore}`);
    const signal = yield* select(selectSignal);
    signal.abort("reset store");
    yield* put(setSignal(new AbortController()));
  }
}

export const sagas = { watchResetToken, watchSignal };
