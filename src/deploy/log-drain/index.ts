import { selectDeploy } from "../slice";
import { PaginateProps, api, cacheTimer, combinePages, thunks } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployLogDrain } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

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

export const logDrainEntities = {
  log_drain: defaultEntity({
    id: "log_drain",
    deserialize: deserializeLogDrain,
    save: addDeployLogDrains,
  }),
};
