import { call, put, select } from 'redux-saga/effects';
import { Action, createTable, createReducerMap } from 'robodux';
import { createQuery, queryCtx, urlParser, FetchCtx, Next } from 'saga-query';
import { batchActions } from 'redux-batched-actions';

import { selectEnv } from '@app/env';
import { AppState, ApiGen, AuthApiError } from '@app/types';
import { loaders } from '@app/loaders';
import { halEntityParser } from '@app/hal';
import { selectElevatedAccessToken, selectAccessToken } from '@app/token';

type EndpointUrl = 'auth' | 'api' | 'billing';

interface FetchApiOpts extends RequestInit {
  url?: string;
  elevated?: boolean;
  quickSave?: boolean;
}

export interface ApiCtx<D = any, P = any, E = any> extends FetchCtx<D, E, P> {}

export interface AuthApiCtx<D = any, P = any>
  extends FetchCtx<D, AuthApiError, P> {
  request: FetchApiOpts;
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

function* fetchApi(request: FetchApiOpts): ApiGen<FetchCtx['response']> {
  const { url = '', elevated = false, ...options } = request;

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

  if (!(options.headers as any).Authorization) {
    let token = '';
    if (elevated) {
      token = yield select(selectElevatedAccessToken);
    } else {
      token = yield select(selectAccessToken);
    }

    if (token) {
      (options.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  const resp: Response = yield call(fetch, url, {
    ...options,
  });

  if (resp.status === 204) {
    return {
      status: resp.status,
      ok: resp.ok,
      data: {},
    };
  }

  let data = {};
  try {
    data = yield call([resp, 'json']);
  } catch (err) {
    return { status: resp.status, ok: false, data: { message: err.message } };
  }

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
    const { url = '' } = ctx.request;
    if (!url) return;
    const fullUrl = url.startsWith('http');
    if (!fullUrl) {
      const baseUrl = yield call(getApiBaseUrl, endpoint);
      ctx.request.url = `${baseUrl}${url}`;
    }

    ctx.response = yield call(fetchApi, ctx.request);
    yield next();
  };
}

function* trackLoading(
  ctx: {
    name: string;
    actions: Action[];
    payload: FetchCtx['payload'];
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
  if (ctx.actions.length === 0) return;
  yield put(batchActions(ctx.actions));
}

const DATA_NAME = 'data';
const data = createTable<any>({ name: DATA_NAME });
export const { selectById: selectDataById } = data.getSelectors(
  (s: AppState) => s[DATA_NAME],
);
export const reducers = createReducerMap(data);
function* quickSave(ctx: AuthApiCtx, next: Next) {
  yield next();
  if (!ctx.response.ok) return;
  const { quickSave = false } = ctx.request;
  if (!quickSave) return;
  ctx.actions.push(
    data.actions.add({
      [JSON.stringify(ctx.action)]: ctx.response.data,
    }),
  );
}

export const authApi = createQuery<AuthApiCtx>();
authApi.use(dispatchActions);
authApi.use(authApi.routes());
authApi.use(quickSave);
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
