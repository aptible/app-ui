import { select } from 'saga-query';

import { authApi } from '@app/api';
import { Token } from '@app/types';
import { selectToken, resetToken } from '@app/token';

export const logout = authApi.delete(
  `/tokens/:tokenId`,
  function* onLogout(ctx, next) {
    const token: Token = yield select(selectToken);
    ctx.request = ctx.req({
      url: `/tokens/${token.tokenId}`,
      method: 'DELETE',
    });

    yield next();

    ctx.actions.push(resetToken());
  },
);
