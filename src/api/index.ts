import { selectEnv } from "@app/config";
import { createLog } from "@app/debug";
import {
  Ok,
  call,
  createApi,
  createThunks,
  mdw,
  parallel,
  put,
  race,
  select,
  takeEvery,
  timer,
} from "@app/fx";
import type {
  ThunkCtx as BaseThunkCtx,
  CreateActionWithPayload,
  LoaderCtx,
  Next,
  Result,
} from "@app/fx";
import { halEntityParser } from "@app/hal";
import { schema } from "@app/schema";
import { selectAccessToken, selectElevatedAccessToken } from "@app/token";
import type {
  Action,
  ApiCtx,
  AppCtx,
  AuthApiCtx,
  DeployApiCtx,
  HalEmbedded,
  MetricTunnelCtx,
  PortalCtx,
  AptibleAiCtx,
} from "@app/types";
import * as Sentry from "@sentry/react";

export interface ThunkCtx<P = any, D = any>
  extends BaseThunkCtx<P>,
    LoaderCtx<P> {
  actions: Action[];
  json: D | null;
}

type EndpointUrl = "auth" | "api" | "billing" | "metrictunnel" | "portal" | "aptibleai";

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
    console.error(err);
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

export const thunkLoader = mdw.loader(schema);

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
thunks.use(mdw.actions);
thunks.use(thunks.routes());

export const resetToken = thunks.create("reset-token", function* (_, next) {
  yield* schema.update(schema.token.reset());
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

  if (endpoint === "portal") {
    return env.portalUrl;
  }

  if (endpoint === "aptibleai") {
    return env.aptibleAiUrl;
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

function* requestPortal(ctx: ApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "portal" as const));
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

function* requestAptibleAi(ctx: ApiCtx, next: Next) {
  const url = yield* call(() => getUrl(ctx, "aptibleai" as const));
  ctx.request = ctx.req({
    url,
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
  const signal = yield* select(schema.signal.select);
  const aborted = () =>
    new Promise<void>((resolve) => {
      signal.signal.addEventListener("abort", () => {
        resolve();
      });
    });
  ctx.request = ctx.req({
    signal: signal.signal,
  });

  yield* race([call(next), call(aborted)]);
}

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export const cacheLongTimer = () => timer(10 * MINUTES);
export const cacheTimer = () => timer(5 * MINUTES);
export const cacheMinTimer = () => timer(60 * SECONDS);
export const cacheShortTimer = () => timer(5 * SECONDS);

function* apiErrorMdw(ctx: ApiCtx, next: Next) {
  const config = yield* select(selectEnv);
  yield* next();
  if (!ctx.json.ok && config.isDev && !config.isTest) {
    console.warn(ctx.json.error, ctx);
  }
}

export const api = createApi<DeployApiCtx>(
  createThunks({ supervisor: takeEvery }),
);
api.use(debugMdw);
api.use(apiErrorMdw);
api.use(sentryErrorHandler);
api.use(expiredToken);
api.use(mdw.api({ schema }));
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
authApi.use(apiErrorMdw);
authApi.use(sentryErrorHandler);
authApi.use(expiredToken);
authApi.use(mdw.api({ schema }));
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
billingApi.use(apiErrorMdw);
billingApi.use(sentryErrorHandler);
billingApi.use(expiredToken);
billingApi.use(mdw.api({ schema }));
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
metricTunnelApi.use(apiErrorMdw);
metricTunnelApi.use(sentryErrorHandler);
metricTunnelApi.use(expiredToken);
metricTunnelApi.use(mdw.api({ schema }));
metricTunnelApi.use(aborter);
metricTunnelApi.use(metricTunnelApi.routes());
metricTunnelApi.use(requestMetricTunnel);
metricTunnelApi.use(aborter);
metricTunnelApi.use(tokenMdw);
metricTunnelApi.use(mdw.fetch());

export const portalApi = createApi<PortalCtx>(
  createThunks({ supervisor: takeEvery }),
);
portalApi.use(debugMdw);
portalApi.use(apiErrorMdw);
portalApi.use(sentryErrorHandler);
portalApi.use(expiredToken);
portalApi.use(mdw.api({ schema }));
portalApi.use(aborter);
portalApi.use(portalApi.routes());
portalApi.use(requestPortal);
portalApi.use(tokenMdw);
portalApi.use(mdw.fetch());


export const aptibleAiApi = createApi<AptibleAiCtx>(
  createThunks({ supervisor: takeEvery }),
);
aptibleAiApi.use(debugMdw);
aptibleAiApi.use(apiErrorMdw);
aptibleAiApi.use(sentryErrorHandler);
aptibleAiApi.use(expiredToken);
aptibleAiApi.use(mdw.api({ schema }));
aptibleAiApi.use(aborter);
aptibleAiApi.use(aptibleAiApi.routes());
aptibleAiApi.use(requestAptibleAi);
aptibleAiApi.use(tokenMdw);
aptibleAiApi.use(mdw.fetch());

export interface PaginateProps {
  page: number;
}

export interface FilterOpProps {
  operationType: string;
  operationStatus: string;
  resourceType: string;
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
    yield* schema.update(schema.loaders.start({ id: ctx.key }));

    const firstPage: DeployApiCtx<HalEmbedded<any>> = yield* call(() =>
      actionFn.run(actionFn({ ...ctx.payload, page: 1 })),
    );

    if (!firstPage.json.ok) {
      const message = firstPage.json.error.message;
      yield* schema.update(schema.loaders.error({ id: ctx.key, message }));
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
    yield* schema.update(schema.loaders.success({ id: ctx.key }));
    yield* next();
  }

  return paginator;
}

export interface Retryable {
  attempts?: number;
}

type ElevatedPostCtx = AuthApiCtx<
  any,
  { userId: string; [key: string]: string | number | boolean }
>;

export function* elevatedUpdate(ctx: ElevatedPostCtx, next: Next) {
  const { userId, ...payload } = ctx.payload;
  ctx.elevated = true;
  ctx.request = ctx.req({
    body: JSON.stringify(payload),
  });
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { message: "Saved changes successfully!" };
}
