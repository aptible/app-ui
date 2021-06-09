import { call, put } from 'redux-saga/effects';
import { createAction, ActionWithPayload } from 'robodux';

import {
  setAuthLoaderStart,
  setAuthLoaderError,
  setAuthLoaderSuccess,
} from '@app/loaders';

import { elevateToken, ElevateToken, ElevateTokenCtx } from './token';

export const elevate = createAction<ElevateToken>('ELEVATE');
export function* onElevate(action: ActionWithPayload<ElevateToken>) {
  yield put(setAuthLoaderStart());
  const ctx: ElevateTokenCtx = yield call(
    elevateToken.run,
    elevateToken(action.payload),
  );

  if (!ctx.response.ok) {
    const { message, error, code, exception_context } = ctx.response.data;
    yield put(
      setAuthLoaderError({
        message,
        meta: { error, code, exception_context },
      }),
    );
    return;
  }

  yield put(setAuthLoaderSuccess());
}
