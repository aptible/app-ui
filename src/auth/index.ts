import { api } from '@app/api';

export const fetchCurrentToken = api.get(
  '/current_token',
  function* onFetch(ctx, next) {
    ctx.request = {
      endpoint: 'auth',
    };
    yield next();
  },
);
