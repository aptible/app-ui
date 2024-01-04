import { api, cacheMinTimer, cacheTimer, thunks } from "@app/api";
import { call } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, db, schema } from "@app/schema";
import { DeployLogDrain, LinkResponse, ProvisionableStatus } from "@app/types";
import { DeployOperationResponse } from "../operation";

export type LogDrainType =
  | "logdna"
  | "papertrail"
  | "tail"
  | "elasticsearch_database"
  | "sumologic"
  | "https_post"
  | "datadog"
  | "syslog_tls_tcp"
  | "insightops";
// there are two legacy types we DO NOT allow creating: elasticsearch / https

export interface CreateLogDrainBase {
  envId: string;
  handle: string;
  drainApps: boolean;
  drainDatabases: boolean;
  drainEphemeralSessions: boolean;
  drainProxies: boolean;
}

export interface CreateLogDnaLogDrain extends CreateLogDrainBase {
  drainType: "logdna"; // formerly called mezmo
  url: string;
}
export interface CreatePapertrailLogDrain extends CreateLogDrainBase {
  drainType: "papertrail";
  drainHost: string;
  drainPort: string;
}
export interface CreateDataDogLogDrain extends CreateLogDrainBase {
  drainType: "datadog";
  url: string;
}
export interface CreateElasticsearchDatabaseLogDrain
  extends CreateLogDrainBase {
  drainType: "elasticsearch_database";
  databaseId: string;
  pipeline?: string;
}
export interface CreateSumoLogicLogDrain extends CreateLogDrainBase {
  drainType: "sumologic";
  url: string;
}
export interface CreateHttpsPostLogDrain extends CreateLogDrainBase {
  drainType: "https_post";
  url: string;
}
export interface CreateSyslogTlsTcpLogDrain extends CreateLogDrainBase {
  drainType: "syslog_tls_tcp";
  drainHost: string;
  drainPort: string;
  loggingToken?: string;
}
export interface CreateInsightOpsLogDrain extends CreateLogDrainBase {
  drainType: "insightops";
  loggingToken?: string;
}

export type CreateLogDrainProps =
  | CreateLogDnaLogDrain
  | CreatePapertrailLogDrain
  | CreateDataDogLogDrain
  | CreateElasticsearchDatabaseLogDrain
  | CreateSumoLogicLogDrain
  | CreateHttpsPostLogDrain
  | CreateSyslogTlsTcpLogDrain
  | CreateInsightOpsLogDrain;

export interface DeployLogDrainResponse {
  id: string;
  handle: string;
  drain_type: string;
  drain_host: string;
  drain_port: string;
  drain_username: string;
  drain_password: string;
  url: string;
  logging_token: string;
  drain_apps: boolean;
  drain_databases: boolean;
  drain_ephemeral_sessions: boolean;
  drain_proxies: boolean;
  created_at: string;
  updated_at: string;
  status: ProvisionableStatus;
  _embedded: {
    backend: {
      channel: string;
    };
  };
  _links: {
    account: LinkResponse;
  };
}

export const deserializeLogDrain = (payload: any): DeployLogDrain => {
  const links = payload._links;

  return {
    id: payload.id,
    handle: payload.handle,
    drainType: payload.drain_type,
    drainHost: payload.drain_host,
    drainPort: payload.drain_port,
    drainUsername: payload.drain_username,
    drainPassword: payload.drain_password,
    url: payload.url,
    loggingToken: payload.logging_token,
    drainApps: payload.drain_apps,
    drainDatabases: payload.drain_databases,
    drainEphemeralSessions: payload.drain_ephemeral_sessions,
    drainProxies: payload.drain_proxies,
    environmentId: extractIdFromLink(links.account),
    backendChannel: payload._embedded.backend.channel,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    status: payload.status,
  };
};

export const defaultLogDrainResponse = (
  md: Partial<DeployLogDrain> = {},
): DeployLogDrainResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drain_type: "datadog",
    drain_host: "",
    drain_port: "",
    drain_username: "",
    drain_password: "",
    url: "",
    logging_token: "",
    drain_apps: false,
    drain_databases: false,
    drain_ephemeral_sessions: false,
    drain_proxies: false,
    status: "pending",
    created_at: now,
    updated_at: now,
    _embedded: {
      backend: {
        channel: "",
      },
    },
    _links: {
      account: defaultHalHref(),
    },
    ...md,
  };
};

export const selectLogDrainById = db.logDrains.selectById;
export const findLogDrainById = db.logDrains.findById;
export const selectLogDrainsAsList = db.logDrains.selectTableAsList;
export const selectLogDrains = db.logDrains.selectTable;

export const selectLogDrainsByEnvId = createSelector(
  selectLogDrainsAsList,
  (_: WebState, props: { envId: string }) => props.envId,
  (logDrains, envId) => {
    return logDrains
      .filter((logDrain) => logDrain.environmentId === envId)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  },
);
export const hasDeployLogDrain = (a: DeployLogDrain) => a.id !== "";

export const fetchLogDrains = api.get(
  "/log_drains?per_page=5000",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(db.logDrains.reset());
  },
);

export const fetchEnvLogDrains = api.get<{ id: string }>(
  "/accounts/:id/log_drains",
  {
    supervisor: cacheTimer(),
  },
);

export const createLogDrain = api.post<
  CreateLogDrainProps,
  DeployLogDrainResponse
>("/accounts/:envId/log_drains", function* (ctx, next) {
  const preBody: Record<string, boolean | string> = {
    drain_type: ctx.payload.drainType,
    handle: ctx.payload.handle,
    drain_apps: ctx.payload.drainApps,
    drain_databases: ctx.payload.drainDatabases,
    drain_proxies: ctx.payload.drainProxies,
    drain_ephemeral_sessions: ctx.payload.drainEphemeralSessions,
  };
  let body = "";
  if (ctx.payload.drainType === "elasticsearch_database") {
    body = JSON.stringify({
      ...preBody,
      database_id: ctx.payload.databaseId,
    });
  } else if (ctx.payload.drainType === "papertrail") {
    const { drainHost, drainPort } = ctx.payload;
    body = JSON.stringify({
      ...preBody,
      drain_type: "papertrail",
      drain_host: drainHost,
      drain_port: drainPort,
    });
  } else if (
    ctx.payload.drainType === "datadog" ||
    ctx.payload.drainType === "logdna" ||
    ctx.payload.drainType === "sumologic" ||
    ctx.payload.drainType === "https_post"
  ) {
    const { url } = ctx.payload;
    body = JSON.stringify({
      ...preBody,
      drain_type: "https_post",
      url,
    });
  } else if (ctx.payload.drainType === "insightops") {
    const drainHost = "api.logentries.com";
    const drainPort = 20000;
    body = JSON.stringify({
      ...preBody,
      drain_type: "syslog_tls_tcp",
      drain_host: drainHost,
      drain_port: drainPort,
    });
  } else {
    const { drainHost, drainPort, loggingToken } = ctx.payload;
    body = JSON.stringify({
      ...preBody,
      drain_type: "syslog_tls_tcp",
      drain_host: drainHost,
      drain_port: drainPort,
      logging_token: loggingToken,
    });
  }

  ctx.request = ctx.req({ body });
  yield* next();
});

export const createLogDrainOperation = api.post<
  { id: string },
  DeployOperationResponse
>("/log_drains/:id/operations", function* (ctx, next) {
  const body = JSON.stringify({
    type: "provision",
  });
  ctx.request = ctx.req({ body });
  yield* next();
});

export const provisionLogDrain = thunks.create<CreateLogDrainProps>(
  "create-and-provision-log-drain",
  function* (ctx, next) {
    const id = ctx.key;
    yield* schema.update(db.loaders.start({ id }));

    const mdCtx = yield* call(() =>
      createLogDrain.run(createLogDrain(ctx.payload)),
    );
    if (!mdCtx.json.ok) {
      const data = mdCtx.json.error as any;
      yield* schema.update(db.loaders.error({ id, message: data.message }));
      return;
    }

    const logDrainId = mdCtx.json.value.id;
    const opCtx = yield* call(() =>
      createLogDrainOperation.run(
        createLogDrainOperation({ id: `${logDrainId}` }),
      ),
    );
    if (!opCtx.json.ok) {
      const data = opCtx.json.error as any;
      yield* schema.update(db.loaders.error({ id, message: data.message }));
      return;
    }

    yield* next();

    yield* schema.update(
      db.loaders.success({
        id,
        meta: { logDrainId, opId: `${opCtx.json.value.id}` } as any,
      }),
    );
  },
);

export const deprovisionLogDrain = api.post<
  { id: string },
  DeployOperationResponse
>(["/log_drains/:id/operations", "deprovision"], function* (ctx, next) {
  const { id } = ctx.payload;
  const body = {
    type: "deprovision",
    id,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Deprovision log drain operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const restartLogDrain = api.post<
  { id: string },
  DeployOperationResponse
>(["/log_drains/:id/operations", "restart"], function* (ctx, next) {
  const { id } = ctx.payload;
  // an empty configure triggers a restart for log drains
  const body = {
    type: "configure",
    id,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Restart log drain operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const logDrainEntities = {
  log_drain: defaultEntity({
    id: "log_drain",
    deserialize: deserializeLogDrain,
    save: db.logDrains.add,
  }),
};
