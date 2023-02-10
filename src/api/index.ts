import {
  createApi,
  fetcher,
  requestMonitor,
  call,
  select,
  createPipe,
  errorHandler,
  dispatchActions,
  timer,
  CreateActionWithPayload,
  put,
  setLoaderStart,
  setLoaderError,
  all,
  setLoaderSuccess,
  LoaderCtx,
} from "saga-query";
import type { ApiCtx, Next, PipeCtx } from "saga-query";

import { selectEnv } from "@app/env";
import type { ApiGen, AuthApiError, Action, HalEmbedded } from "@app/types";
import { halEntityParser } from "@app/hal";
import { selectAccessToken, selectElevatedAccessToken } from "@app/token";

type EndpointUrl = "auth" | "api" | "billing";

export interface AppCtx<P = any, S = any>
  extends ApiCtx<P, S, { message: string }> {}
export interface DeployApiCtx<P = any, S = any>
  extends ApiCtx<P, S, { message: string }> {}
export interface AuthApiCtx<P = any, S = any>
  extends ApiCtx<P, S, AuthApiError> {
  elevated: boolean;
}

export function* elevetatedMdw(ctx: AuthApiCtx, next: Next): ApiGen {
  ctx.elevated = true;
  yield next();
}

function* getApiBaseUrl(endpoint: EndpointUrl): ApiGen<string> {
  const env = yield* select(selectEnv);
  if (endpoint === "auth") {
    return env.authUrl;
  }

  if (endpoint === "billing") {
    return env.billingUrl;
  }

  return env.apiUrl;
}

function* tokenMdw(ctx: ApiCtx, next: Next): ApiGen {
  const token = yield* select(selectAccessToken);
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

  const token = yield* select(selectElevatedAccessToken);
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
  const fullUrl = url.startsWith("http");
  if (fullUrl) {
    return url;
  }

  const baseUrl = yield* call(getApiBaseUrl, endpoint);
  return `${baseUrl}${url}`;
}

function* requestApi(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "api" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "include",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield next();
}

function* requestAuth(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "auth" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "include",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield next();
}

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export const cacheTimer = () => timer(5 * MINUTES);

export const api = createApi<DeployApiCtx>();
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

export interface ThunkCtx<P = any, D = any> extends PipeCtx<P>, LoaderCtx<P> {
  actions: Action[];
  json: D | null;
}

export interface PaginateProps {
  page: number;
}

/**
 * Loops through all the pages of an endpoint
 */
export function combinePages(
  actionFn: CreateActionWithPayload<DeployApiCtx, PaginateProps>,
) {
  function* paginator(ctx: ThunkCtx, next: Next) {
    let results: DeployApiCtx[] = [];
    yield put(setLoaderStart({ id: ctx.key }));

    const firstPage: DeployApiCtx<HalEmbedded<any>> = yield call(
      actionFn.run,
      actionFn({ page: 1 }),
    );

    if (!firstPage.json.ok) {
      const message = firstPage.json.data.message;
      yield put(setLoaderError({ id: ctx.key, message }));
      yield next();
      return;
    }

    results = [firstPage];

    if (firstPage.json.data.current_page) {
      const cur = firstPage.json.data.current_page;
      const total = firstPage.json.data.total_count || 0;
      const per = firstPage.json.data.per_page || 0;
      const lastPage = Math.ceil(total / per);
      const fetchAll = [];
      for (let i = cur + 1; i <= lastPage; i += 1) {
        fetchAll.push(call(actionFn.run, actionFn({ page: i })));
      }
      if (fetchAll.length > 0) {
        results = yield all(fetchAll);
      }
    }

    ctx.json = { data: results };
    yield put(setLoaderSuccess({ id: ctx.key }));
    yield next();
  }

  return paginator;
}

export const thunks = createPipe<ThunkCtx>();
thunks.use(errorHandler);
thunks.use(function* (ctx, next) {
  ctx.json = null;
  yield next();
});
thunks.use(dispatchActions);
thunks.use(thunks.routes());
