import { select } from 'redux-saga/effects';

import { authApi } from '@app/api';
import { Token } from '@app/types';
import { selectToken, resetToken } from '@app/token';

export const logout = authApi.delete(
  `/tokens/:tokenId`,
  function* onLogout(ctx, next) {
    const token: Token = yield select(selectToken);
    ctx.request = {
      url: `/tokens/${token.tokenId}`,
    };

    yield next();

    if (!ctx.response.ok) return;

    ctx.actions.push(resetToken());
  },
);
