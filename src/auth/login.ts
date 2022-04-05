import {
  put,
  call,
  setLoaderStart,
  setLoaderSuccess,
  setLoaderError,
} from 'saga-query';

import { CreateTokenPayload, createToken, TokenCtx } from './token';
import { AUTH_LOADER_ID } from './loader';
import { ThunkCtx, thunks } from '@app/api';

export const login = thunks.create<CreateTokenPayload>(
  'login',
  function* onLogin(ctx: ThunkCtx<CreateTokenPayload>, next) {
    yield put(setLoaderStart({ id: AUTH_LOADER_ID }));
    const tokenCtx: TokenCtx = yield call(
      createToken.run,
      createToken(ctx.payload),
    );
    console.log(tokenCtx);

    if (!tokenCtx.json.ok) {
      const { message, error, code, exception_context } = tokenCtx.json.data;
      yield put(
        setLoaderError({
          id: AUTH_LOADER_ID,
          message,
          meta: { error, code, exception_context },
        }),
      );
      return;
    }

    yield put(setLoaderSuccess({ id: AUTH_LOADER_ID }));
    yield next();
  },
);
