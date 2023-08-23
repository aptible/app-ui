import { selectDeploy } from "../slice";
import { PaginateProps, api, cacheTimer, combinePages, thunks } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import {
  AppState,
  DeployLogDrain,
  DeployOperationResponse,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

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
    _links: {
      account: defaultHalHref(),
    },
    ...md,
  };
};

export const defaultDeployLogDrain = (
  ld: Partial<DeployLogDrain> = {},
): DeployLogDrain => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drainType: "",
    drainHost: "",
    drainPort: "",
    drainUsername: "",
    drainPassword: "",
    url: "",
    loggingToken: "",
    drainApps: false,
    drainProxies: false,
    drainEphemeralSessions: false,
    drainDatabases: false,
    environmentId: "",
    createdAt: now,
    updatedAt: now,
    status: "pending",
    ...ld,
  };
};

export const DEPLOY_LOG_DRAIN_NAME = "logDrains";
const slice = createTable<DeployLogDrain>({ name: DEPLOY_LOG_DRAIN_NAME });
const { add: addDeployLogDrains } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_LOG_DRAIN_NAME],
);
const initLogDrain = defaultDeployLogDrain();
const must = mustSelectEntity(initLogDrain);
export const selectLogDrainById = must(selectors.selectById);
export const findLogDrainById = must(selectors.findById);
export const {
  selectTableAsList: selectLogDrainsAsList,
  selectTable: selectLogDrains,
} = selectors;
export const selectLogDrainsByEnvId = createSelector(
  selectLogDrainsAsList,
  (_: AppState, props: { envId: string }) => props.envId,
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
export const logDrainReducers = createReducerMap(slice);

export const fetchLogDrains = api.get<PaginateProps>("/log_drains?page=:page", {
  saga: cacheTimer(),
});
export const fetchAllLogDrains = thunks.create(
  "fetch-all-log-drains",
  combinePages(fetchLogDrains),
);
export const fetchEnvLogDrains = api.get<{ id: string }>(
  "/accounts/:id/log_drains",
  {
    saga: cacheTimer(),
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
    yield* put(setLoaderStart({ id: ctx.key }));

    const mdCtx = yield* call(createLogDrain.run, createLogDrain(ctx.payload));
    if (!mdCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: mdCtx.json.data.message }),
      );
      return;
    }

    const logDrainId = mdCtx.json.data.id;
    const opCtx = yield* call(
      createLogDrainOperation.run,
      createLogDrainOperation({ id: `${logDrainId}` }),
    );
    if (!opCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    yield* next();

    yield* put(
      setLoaderSuccess({
        id: ctx.key,
        meta: { logDrainId, opId: `${opCtx.json.data.id}` },
      }),
    );
  },
);

export const logDrainEntities = {
  log_drain: defaultEntity({
    id: "log_drain",
    deserialize: deserializeLogDrain,
    save: addDeployLogDrains,
  }),
};
