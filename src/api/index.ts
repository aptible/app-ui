import {
  all,
  call,
  createApi,
  createPipe,
  dispatchActions,
  fetcher,
  put,
  race,
  requestMonitor,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
  timer,
} from "@app/fx";
import type {
  ApiCtx,
  CreateActionWithPayload,
  LoaderCtx,
  Next,
  PipeCtx,
} from "@app/fx";
import * as Sentry from "@sentry/react";

import { createLog } from "@app/debug";
import { selectEnv } from "@app/env";
import { halEntityParser } from "@app/hal";
import { selectSignal } from "@app/signal";
import {
  resetToken,
  selectAccessToken,
  selectElevatedAccessToken,
} from "@app/token";
import type {
  Action,
  ApiGen,
  AppCtx,
  AuthApiCtx,
  DeployApiCtx,
  HalEmbedded,
  MetricTunnelCtx,
} from "@app/types";

type EndpointUrl = "auth" | "api" | "billing" | "metrictunnel";

const log = createLog("fx");

export function* elevetatedMdw(ctx: AuthApiCtx, next: Next): ApiGen {
  ctx.elevated = true;
  yield* next();
}

function* debugMdw(ctx: PipeCtx, next: Next) {
  log(`${ctx.name}`, ctx);
  yield* next();
}

const ignoreErrs: RegExp[] = [
  /failed to fetch/i,
  /reset store/i,
  /networkerror when attempting to fetch resource/i,
  /load failed/i,
];
function* sentryErrorHandler(ctx: ApiCtx | ThunkCtx, next: Next) {
  try {
    yield* next();
  } catch (err) {
    if (err instanceof Error) {
      for (const matcher of ignoreErrs) {
        if (matcher.test(err.message)) {
          return;
        }
      }
    }

    Sentry.captureException(err, {
      contexts: { extras: { queryCtx: JSON.stringify(ctx) } },
    });
  }
}

function* getApiBaseUrl(endpoint: EndpointUrl): ApiGen<string> {
  const env = yield* select(selectEnv);
  if (endpoint === "auth") {
    return env.authUrl;
  }

  if (endpoint === "billing") {
    return env.billingUrl;
  }

  if (endpoint === "metrictunnel") {
    return env.metricTunnelUrl;
  }

  return env.apiUrl;
}

function* tokenMdw(ctx: ApiCtx & { noToken?: boolean }, next: Next): ApiGen {
  if (ctx.noToken) {
    yield* next();
    return;
  }

  const token = yield* select(selectAccessToken);
  if (!token) {
    yield* next();
    return;
  }

  ctx.request = ctx.req({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  yield* next();
}

function* elevatedTokenMdw(ctx: AuthApiCtx, next: Next): ApiGen {
  if (!ctx.elevated) {
    yield* next();
    return;
  }

  const token = yield* select(selectElevatedAccessToken);
  if (!token) {
    yield* next();
    return;
  }

  ctx.request = ctx.req({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  yield* next();
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

function* requestBilling(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "billing" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "omit",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestApi(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "api" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "omit",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestAuth(ctx: AuthApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "auth" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: ctx.credentials || "omit",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestMetricTunnel(ctx: ApiCtx, next: Next): ApiGen {
  const url = yield* call(getUrl, ctx, "metrictunnel" as const);
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
    },
  });

  yield* next();
}

function* expiredToken(ctx: ApiCtx, next: Next) {
  yield* next();
  if (!ctx.response) return;
  if (ctx.req().method === "GET" && ctx.response.status === 401) {
    yield* put(resetToken());
  }
}

function* aborter(ctx: ApiCtx, next: Next) {
  const signal = yield* select(selectSignal);
  const aborted = () =>
    new Promise<void>((resolve) => {
      signal.signal.addEventListener("abort", () => {
        resolve();
      });
    });
  ctx.request = ctx.req({
    signal: signal.signal,
  });

  yield* race([next(), call(aborted)]);
}

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export const cacheTimer = () => timer(5 * MINUTES);
export const cacheMinTimer = () => timer(60 * SECONDS);
export const cacheShortTimer = () => timer(5 * SECONDS);

export const api = createApi<DeployApiCtx>();
api.use(debugMdw);
api.use(sentryErrorHandler);
api.use(expiredToken);
api.use(requestMonitor());
api.use(aborter);
api.use(requestApi);
api.use(api.routes());
api.use(halEntityParser);
api.use(tokenMdw);
api.use(fetcher());

export const authApi = createApi<AuthApiCtx>();
authApi.use(debugMdw);
authApi.use(sentryErrorHandler);
authApi.use(expiredToken);
authApi.use(requestMonitor());
authApi.use(aborter);
authApi.use(halEntityParser);
authApi.use(authApi.routes());
authApi.use(requestAuth);
authApi.use(tokenMdw);
authApi.use(elevatedTokenMdw);
authApi.use(fetcher());

export const billingApi = createApi<DeployApiCtx>();
billingApi.use(debugMdw);
billingApi.use(sentryErrorHandler);
billingApi.use(expiredToken);
billingApi.use(requestMonitor());
billingApi.use(aborter);
billingApi.use(halEntityParser);
billingApi.use(billingApi.routes());
billingApi.use(requestBilling);
billingApi.use(tokenMdw);
billingApi.use(fetcher());

export const metricTunnelApi = createApi<MetricTunnelCtx>();
metricTunnelApi.use(debugMdw);
metricTunnelApi.use(sentryErrorHandler);
metricTunnelApi.use(expiredToken);
metricTunnelApi.use(requestMonitor());
metricTunnelApi.use(aborter);
metricTunnelApi.use(metricTunnelApi.routes());
metricTunnelApi.use(requestMetricTunnel);
metricTunnelApi.use(aborter);
metricTunnelApi.use(tokenMdw);
metricTunnelApi.use(fetcher());

export interface ThunkCtx<P = any, D = any> extends PipeCtx<P>, LoaderCtx<P> {
  actions: Action[];
  json: D | null;
}

export interface PaginateProps {
  page: number;
}

interface CombinePagesProps {
  max: number;
}

/**
 * Loops through all the pages of an endpoint automatically
 */
export function combinePages<
  P extends { [key: string]: any } = { [key: string]: any },
>(
  actionFn: CreateActionWithPayload<DeployApiCtx, PaginateProps & P>,
  { max = 15 }: CombinePagesProps = { max: 15 },
) {
  function* paginator(ctx: ThunkCtx, next: Next) {
    let results: DeployApiCtx[] = [];
    yield put(setLoaderStart({ id: ctx.key }));

    const firstPage: DeployApiCtx<HalEmbedded<any>> = yield* call(
      actionFn.run,
      actionFn({ ...ctx.payload, page: 1 }),
    );

    if (!firstPage.json.ok) {
      const message = firstPage.json.data.message;
      yield* put(setLoaderError({ id: ctx.key, message }));
      yield* next();
      return;
    }

    results = [firstPage];

    if (firstPage.json.data.current_page) {
      const cur = firstPage.json.data.current_page;
      const total = firstPage.json.data.total_count || 0;
      const per = firstPage.json.data.per_page || 0;
      const lastPage = Math.min(max, Math.ceil(total / per));
      const fetchAll = [];
      for (let i = cur + 1; i <= lastPage; i += 1) {
        fetchAll.push(
          call(actionFn.run, actionFn({ ...ctx.payload, page: i })),
        );
      }
      if (fetchAll.length > 0) {
        results = yield* all(fetchAll);
      }
    }

    ctx.json = { data: results };
    yield* put(setLoaderSuccess({ id: ctx.key }));
    yield* next();
  }

  return paginator;
}

export interface Retryable {
  attempts?: number;
}

export const thunks = createPipe<ThunkCtx>();
thunks.use(debugMdw);
thunks.use(sentryErrorHandler);
thunks.use(function* (ctx, next) {
  ctx.json = null;
  yield* next();
});
thunks.use(dispatchActions);
thunks.use(thunks.routes());
