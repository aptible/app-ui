import { call, select } from 'redux-saga/effects';
import {
  createQuery,
  queryCtx,
  urlParser,
  FetchCtx,
  Next,
  loadingTracker,
} from 'saga-query';

import { selectEnv } from '@app/env';
import { ApiGen, AuthLoaderMessage } from '@app/types';
import { loaders } from '@app/loaders';

type EndpointUrl = 'auth' | 'api' | 'billing';

interface FetchApiOpts extends RequestInit {
  url?: string;
}

export interface ApiCtx<D = any, P = any, E = any> extends FetchCtx<D, E, P> {}

export interface AuthApiCtx<D = any, P = any>
  extends FetchCtx<D, AuthLoaderMessage, P> {}

function* getApiBaseUrl(endpoint: EndpointUrl): ApiGen {
  const env = yield select(selectEnv);
  if (endpoint === 'auth') {
    return env.authUrl;
  }

  if (endpoint === 'billing') {
    return env.billingUrl;
  }

  return env.apiUrl;
}

function* fetchApi(request: FetchApiOpts): ApiGen {
  const { url = '', ...options } = request;

  const resp = yield call(fetch, url, {
    ...options,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'same-origin',
  });

  if (resp.status === 204) {
    return {
      status: resp.status,
      ok: resp.ok,
      data: {},
    };
  }

  const data = yield call([resp, 'json']);

  if (!resp.ok) {
    return { status: resp.status, ok: false, data };
  }

  return {
    status: resp.status,
    ok: true,
    data: { status: 'failure', message: 'something went wrong' },
  };
}

function createFetchApi(endpoint: EndpointUrl) {
  return function* onFetchApi(ctx: FetchCtx, next: Next): ApiGen {
    const baseUrl = yield call(getApiBaseUrl, endpoint);
    ctx.request.url = `${baseUrl}${ctx.request.url}`;
    ctx.response = yield call(fetchApi, ctx.request);
    yield next();
  };
}

export const authApi = createQuery<AuthApiCtx>();
authApi.use(queryCtx);
authApi.use(urlParser);
authApi.use(loadingTracker(loaders));
authApi.use(createFetchApi('auth'));

export const api = createQuery<ApiCtx>();
api.use(queryCtx);
api.use(urlParser);
api.use(loadingTracker(loaders));
api.use(createFetchApi('api'));
