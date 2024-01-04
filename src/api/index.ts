import { selectEnv } from "@app/config";
import { createLog } from "@app/debug";
import {
  Ok,
  call,
  createApi,
  createThunks,
  dispatchActions,
  mdw,
  parallel,
  put,
  race,
  select,
  storeMdw,
  takeEvery,
  timer,
} from "@app/fx";
import type {
  CreateActionWithPayload,
  LoaderCtx,
  Next,
  Result,
  ThunkCtx as BaseThunkCtx,
} from "@app/fx";
import { halEntityParser } from "@app/hal";
import { db, schema } from "@app/schema";
import { selectAccessToken, selectElevatedAccessToken } from "@app/token";
import type {
  Action,
  ApiCtx,
  AppCtx,
  AuthApiCtx,
  DeployApiCtx,
  HalEmbedded,
  MetricTunnelCtx,
} from "@app/types";
import * as Sentry from "@sentry/react";

export interface ThunkCtx<P = any, D = any>
  extends BaseThunkCtx<P>,
    LoaderCtx<P> {
  actions: Action[];
  json: D | null;
}

type EndpointUrl = "auth" | "api" | "billing" | "metrictunnel";

const log = createLog("fx");

const ignoreErrs: RegExp[] = [
  /failed to fetch/i,
  /reset store/i,
  /networkerror when attempting to fetch resource/i,
  /load failed/i,
  /request signal is aborted/i,
  /the operation was aborted/i,
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

function* debugMdw(ctx: ThunkCtx, next: Next) {
  log(`${ctx.name}`, ctx);
  yield* next();
}

export const thunks = createThunks<ThunkCtx>({ supervisor: takeEvery });
thunks.use(debugMdw);
thunks.use(sentryErrorHandler);
thunks.use(function* (ctx, next) {
  ctx.json = null;
  yield* next();
});
thunks.use(dispatchActions);
thunks.use(thunks.routes());

export const resetToken = thunks.create("reset-token", function* (_, next) {
  yield* schema.update(db.token.reset());
  yield* next();
});

export function* elevetatedMdw(ctx: AuthApiCtx, next: Next) {
  ctx.elevated = true;
  yield* next();
}

function* getApiBaseUrl(endpoint: EndpointUrl) {
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

function* tokenMdw(ctx: ApiCtx & { noToken?: boolean }, next: Next) {
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

function* elevatedTokenMdw(ctx: AuthApiCtx, next: Next) {
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

function* getUrl(ctx: AppCtx, endpoint: EndpointUrl) {
  const { url } = ctx.req();
  const fullUrl = url.startsWith("http");
  if (fullUrl) {
    return url;
  }

  const baseUrl = yield* call(() => getApiBaseUrl(endpoint));
  return `${baseUrl}${url}`;
}

function* requestBilling(ctx: ApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "billing" as const));
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "include",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestApi(ctx: ApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "api" as const));
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "include",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestAuth(ctx: AuthApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "auth" as const));
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: ctx.credentials || "include",
    headers: {
      "Content-Type": "application/hal+json",
    },
  });

  yield* next();
}

function* requestMetricTunnel(ctx: ApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "metrictunnel" as const));
  ctx.request = ctx.req({
    url,
    // https://github.com/github/fetch#sending-cookies
    credentials: "include",
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
  const signal = yield* select(db.signal.select);
  const aborted = () =>
    new Promise<void>((resolve) => {
      signal.signal.addEventListener("abort", () => {
        resolve();
      });
    });
  ctx.request = ctx.req({
    signal: signal.signal,
  });

  yield* race({ next, aborted });
}

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export const cacheTimer = () => timer(5 * MINUTES);
export const cacheMinTimer = () => timer(60 * SECONDS);
export const cacheShortTimer = () => timer(5 * SECONDS);

export const api = createApi<DeployApiCtx>(
  createThunks({ supervisor: takeEvery }),
);
api.use(debugMdw);
api.use(sentryErrorHandler);
api.use(expiredToken);
api.use(storeMdw(db));
api.use(mdw.api());
api.use(aborter);
api.use(requestApi);
api.use(halEntityParser);
api.use(api.routes());
api.use(tokenMdw);
api.use(mdw.fetch());

export const authApi = createApi<AuthApiCtx>(
  createThunks({ supervisor: takeEvery }),
);
authApi.use(debugMdw);
authApi.use(sentryErrorHandler);
authApi.use(expiredToken);
authApi.use(storeMdw(db));
authApi.use(mdw.api());
authApi.use(aborter);
authApi.use(halEntityParser);
authApi.use(authApi.routes());
authApi.use(requestAuth);
authApi.use(tokenMdw);
authApi.use(elevatedTokenMdw);
authApi.use(mdw.fetch());

export const billingApi = createApi<DeployApiCtx>(
  createThunks({ supervisor: takeEvery }),
);
billingApi.use(debugMdw);
billingApi.use(sentryErrorHandler);
billingApi.use(expiredToken);
billingApi.use(storeMdw(db));
billingApi.use(mdw.api());
billingApi.use(aborter);
billingApi.use(halEntityParser);
billingApi.use(billingApi.routes());
billingApi.use(requestBilling);
billingApi.use(tokenMdw);
billingApi.use(mdw.fetch());

export const metricTunnelApi = createApi<MetricTunnelCtx>(
  createThunks({ supervisor: takeEvery }),
);
metricTunnelApi.use(debugMdw);
metricTunnelApi.use(sentryErrorHandler);
metricTunnelApi.use(expiredToken);
metricTunnelApi.use(storeMdw(db));
metricTunnelApi.use(mdw.api());
metricTunnelApi.use(aborter);
metricTunnelApi.use(metricTunnelApi.routes());
metricTunnelApi.use(requestMetricTunnel);
metricTunnelApi.use(aborter);
metricTunnelApi.use(tokenMdw);
metricTunnelApi.use(mdw.fetch());

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
  { max = 50 }: CombinePagesProps = { max: 50 },
) {
  function* paginator(ctx: ThunkCtx, next: Next) {
    let results: Result<DeployApiCtx>[] = [];
    yield* schema.update(db.loaders.start({ id: ctx.key }));

    const firstPage: DeployApiCtx<HalEmbedded<any>> = yield* call(() =>
      actionFn.run(actionFn({ ...ctx.payload, page: 1 })),
    );

    if (!firstPage.json.ok) {
      const message = firstPage.json.error.message;
      yield* schema.update(db.loaders.error({ id: ctx.key, message }));
      yield* next();
      return;
    }

    results = [Ok(firstPage)];

    if (firstPage.json.value.current_page) {
      const cur = firstPage.json.value.current_page;
      const total = firstPage.json.value.total_count || 0;
      const per = firstPage.json.value.per_page || 0;
      const lastPage = Math.min(max, Math.ceil(total / per));
      const fetchAll = [];
      for (let i = cur + 1; i <= lastPage; i += 1) {
        fetchAll.push(() =>
          actionFn.run(actionFn({ ...ctx.payload, page: i })),
        );
      }
      if (fetchAll.length > 0) {
        const group = yield* parallel(fetchAll);
        results = yield* group;
      }
    }

    ctx.json = { data: results };
    yield* schema.update(db.loaders.success({ id: ctx.key }));
    yield* next();
  }

  return paginator;
}

export interface Retryable {
  attempts?: number;
}
