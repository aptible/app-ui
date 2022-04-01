import { call, put } from 'saga-query';
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

  if (!ctx.json.ok) {
    const { message, error, code, exception_context } = ctx.json.data;
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
