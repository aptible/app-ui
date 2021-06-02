import { put, select } from 'redux-saga/effects';
import { batchActions } from 'redux-batched-actions';

import { Token } from '@app/types';
import { api } from '@app/api';
import { resetToken, selectToken } from '@app/token';
import { resetCurrentUser } from '@app/users';

export const fetchCurrentToken = api.get(
  '/current_token',
  api.request({ endpoint: 'auth' }),
);

export const logout = api.delete(`/tokens/:tokenId`, function* (ctx, next) {
  const token: Token = yield select(selectToken);
  ctx.request = {
    endpoint: 'auth',
    url: `/tokens/${token.tokenId}`,
  };

  yield next();

  if (!ctx.response.ok) return;

  yield put(batchActions([resetToken(), resetCurrentUser()]));
});
