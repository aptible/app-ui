import { call, put, select } from 'redux-saga/effects';
import { Action } from 'robodux';
import { createQuery, queryCtx, urlParser, FetchCtx, Next } from 'saga-query';
import { batchActions } from 'redux-batched-actions';

import { selectEnv } from '@app/env';
import { ApiGen, AuthLoaderMessage } from '@app/types';
import { loaders } from '@app/loaders';
import { halEntityParser } from '@app/hal';

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

  if (!options.headers) {
    options.headers = {} as HeadersInit;
  }

  if (!options.credentials) {
    // https://github.com/github/fetch#sending-cookies
    options.credentials = 'include';
  }

  if (!(options.headers as any)['Content-Type']) {
    (options.headers as any)['Content-Type'] = 'application/hal+json';
  }

  const resp = yield call(fetch, url, {
    ...options,
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
    data,
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

function* trackLoading(
  ctx: {
    name: string;
    payload: FetchCtx['payload'];
    actions: Action[];
    response: FetchCtx['response'];
  },
  next: Next,
) {
  const id = ctx.name;
  yield put(loaders.actions.loading({ id }));

  yield next();

  if (!ctx.response.ok) {
    ctx.actions.push(
      loaders.actions.error({ id, message: ctx.response.data.message }),
    );
    return;
  }

  ctx.actions.push(loaders.actions.success({ id }));
}

export function* dispatchActions(ctx: { actions: Action[] }, next: Next) {
  yield next();
  yield put(batchActions(ctx.actions));
}

export const authApi = createQuery<AuthApiCtx>();
authApi.use(dispatchActions);
authApi.use(authApi.routes());
authApi.use(queryCtx);
authApi.use(urlParser);
authApi.use(halEntityParser);
authApi.use(trackLoading);
authApi.use(createFetchApi('auth'));

export const api = createQuery<ApiCtx>();
api.use(dispatchActions);
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
api.use(halEntityParser);
api.use(trackLoading);
api.use(createFetchApi('api'));
