import {
  createApi,
  fetcher,
  requestMonitor,
  call,
  select,
  createPipe,
  errorHandler,
  dispatchActions,
} from 'saga-query';
import type { ApiCtx, Next, PipeCtx } from 'saga-query';
import type { Action } from 'redux';

import { selectEnv } from '@app/env';
import type { ApiGen, AuthApiError } from '@app/types';
import { halEntityParser } from '@app/hal';
import { selectAccessToken, selectElevatedAccessToken } from '@app/token';

type EndpointUrl = 'auth' | 'api' | 'billing';

export interface AppCtx<S = any, P = any>
  extends ApiCtx<P, S, { message: string }> {}
export interface AuthApiCtx<S = any, P = any>
  extends ApiCtx<P, S, AuthApiError> {
  elevated: boolean;
}

export function* elevetatedMdw(ctx: AuthApiCtx, next: Next): ApiGen {
  ctx.elevated = true;
  yield next();
}

function* getApiBaseUrl(endpoint: EndpointUrl): ApiGen<string> {
  const env = yield select(selectEnv);
  if (endpoint === 'auth') {
    return env.authUrl;
  }

  if (endpoint === 'billing') {
    return env.billingUrl;
  }

  return env.apiUrl;
}

function* tokenMdw(ctx: ApiCtx, next: Next): ApiGen {
  const token = yield select(selectAccessToken);
  if (!token) {
    yield next();
    return;
  }

  ctx.request = ctx.req({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  yield next();
}

function* elevatedTokenMdw(ctx: AuthApiCtx, next: Next): ApiGen {
  if (!ctx.elevated) {
    yield next();
    return;
  }

  const token = yield select(selectElevatedAccessToken);
  if (!token) {
    yield next();
    return;
  }

  ctx.request = ctx.req({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  yield next();
}

function* getUrl(ctx: AppCtx, endpoint: EndpointUrl): ApiGen<string> {
  const { url } = ctx.req();
  const fullUrl = url.startsWith('http');
  if (fullUrl) return url;

  const baseUrl = yield call(getApiBaseUrl, endpoint);
  return `${baseUrl}${url}`;
}

function* requestApi(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield call(getUrl, ctx, 'api');
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'include',
    headers: {
      'Content-Type': 'application/hal+json',
    },
  });

  yield next();
}

function* requestAuth(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield call(getUrl, ctx, 'auth');
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'include',
    headers: {
      'Content-Type': 'application/hal+json',
    },
  });

  yield next();
}

export const api = createApi<ApiCtx>();
api.use(requestMonitor());
api.use(api.routes());
api.use(halEntityParser);
api.use(requestApi);
api.use(tokenMdw);
api.use(fetcher());

export const authApi = createApi<AuthApiCtx>();
authApi.use(requestMonitor());
authApi.use(authApi.routes());
authApi.use(halEntityParser);
authApi.use(requestAuth);
authApi.use(tokenMdw);
authApi.use(elevatedTokenMdw);
authApi.use(fetcher());

export interface ThunkCtx<P = any> extends PipeCtx<P> {
  actions: Action[];
}

export const thunks = createPipe<ThunkCtx>();
thunks.use(errorHandler);
thunks.use(dispatchActions);
thunks.use(thunks.routes());
