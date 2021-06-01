import { call, select } from 'redux-saga/effects';
import { createQuery, queryCtx, urlParser, FetchCtx, Next } from 'saga-query';

import { selectEnv } from '@app/env';

type EndpointUrl = 'auth' | 'api' | 'billing';

interface FetchApiOpts extends RequestInit {
  url?: string;
  endpoint?: EndpointUrl;
}

export interface ApiCtx extends FetchCtx {
  request: FetchApiOpts;
}

function* getApiBaseUrl(endpoint: EndpointUrl): Generator<any, any, any> {
  const env = yield select(selectEnv);
  if (endpoint === 'auth') {
    return env.authUrl;
  }

  if (endpoint === 'billing') {
    return env.billingUrl;
  }

  return env.apiUrl;
}

function* fetchApi(ctx: ApiCtx, next: Next): Generator<any, any, any> {
  const { url, endpoint = 'api', ...options } = ctx.request;
  console.log(ctx.request);
  const baseUrl = yield call(getApiBaseUrl, endpoint);

  const apiUrl = `${baseUrl}${url}`;
  const resp = yield call(fetch, apiUrl, {
    ...options,
    // https://github.com/github/fetch#sending-cookies
    credentials: 'same-origin',
  });

  if (resp.status === 204) {
    ctx.response = {
      status: resp.status,
      ok: resp.ok,
      data: {},
    };
    yield next();
    return;
  }

  const data = yield call([resp, 'json']);

  if (!resp.ok) {
    ctx.response = { status: resp.status, ok: true, data };
  } else {
    ctx.response = {
      status: resp.status,
      ok: false,
      data: { status: 'failure', message: 'something went wrong' },
    };
  }
  yield next();
}

export const api = createQuery<ApiCtx>();
api.use(queryCtx);
api.use(urlParser);
api.use(fetchApi);
