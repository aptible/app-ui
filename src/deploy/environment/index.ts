import {
  DeployApiCtx,
  PaginateProps,
  api,
  cacheTimer,
  combinePages,
  thunks,
} from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { AppState, DeployEnvironment, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

import { selectDeploy } from "../slice";

interface DeployEnvironmentResponse {
  id: string;
  handle: string;
  created_at: string;
  updated_at: string;
  type: "production" | "development";
  activated: boolean;
  container_count: number;
  domain_count: number;
  total_disk_size: number;
  total_app_count: number;
  app_container_count: number;
  database_container_count: number;
  total_database_count: number;
  sweetness_stack: string;
  total_backup_size: number;
  _links: {
    environment: LinkResponse;
    stack: LinkResponse;
  };
}

export const deserializeDeployEnvironment = (
  payload: DeployEnvironmentResponse,
): DeployEnvironment => ({
  id: `${payload.id}`,
  handle: payload.handle,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
  type: payload.type,
  activated: payload.activated,
  containerCount: payload.container_count,
  domainCount: payload.domain_count,
  totalDiskSize: payload.total_disk_size,
  totalAppCount: payload.total_app_count,
  appContainerCount: payload.app_container_count,
  databaseContainerCount: payload.database_container_count,
  totalDatabaseCount: payload.total_database_count,
  sweetnessStack: payload.sweetness_stack,
  totalBackupSize: payload.total_backup_size,
  stackId: extractIdFromLink(payload._links.stack),
});

export const defaultDeployEnvironment = (
  e: Partial<DeployEnvironment> = {},
): DeployEnvironment => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    createdAt: now,
    updatedAt: now,
    type: "development",
    activated: true,
    containerCount: 0,
    domainCount: 0,
    totalDiskSize: 0,
    totalAppCount: 0,
    totalDatabaseCount: 0,
    appContainerCount: 0,
    databaseContainerCount: 0,
    sweetnessStack: "",
    totalBackupSize: 0,
    stackId: "",
    ...e,
  };
};

export const DEPLOY_ENVIRONMENT_NAME = "environments";
const slice = createTable<DeployEnvironment>({
  name: DEPLOY_ENVIRONMENT_NAME,
});
const { add: addDeployEnvironments } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ENVIRONMENT_NAME],
);
const initEnv = defaultDeployEnvironment();
const must = mustSelectEntity(initEnv);
export const selectEnvironmentById = must(selectors.selectById);
export const {
  selectTable: selectEnvironments,
  selectTableAsList: selectEnvironmentsAsList,
} = selectors;
export const findEnvById = must(selectors.findById);
export const selectEnvironmentsAsOptions = createSelector(
  selectEnvironmentsAsList,
  (envs) => {
    return envs.map((e) => {
      return {
        label: e.handle,
        value: e.id,
      };
    });
  },
);
export const hasDeployEnvironment = (a: DeployEnvironment) => a.id !== "";
export const environmentReducers = createReducerMap(slice);
export const selectEnvironmentByName = createSelector(
  selectEnvironmentsAsList,
  (_: AppState, p: { handle: string }) => p.handle,
  (envs, handle) => {
    return envs.find((e) => e.handle === handle) || initEnv;
  },
);

export const fetchEnvironments = api.get<PaginateProps>(
  "/accounts?page=:page",
  { saga: cacheTimer() },
);
export const fetchAllEnvironments = thunks.create(
  "fetch-all-envs",
  { saga: cacheTimer() },
  combinePages(fetchEnvironments),
);

export const fetchEnvironment = api.get<{ id: string }>("/accounts/:id");

export const fetchEnvironmentOperations = api.get<{ id: string }>(
  "/accounts/:id/operations",
  { saga: cacheTimer() },
  api.cache(),
);

interface CreateEnvProps {
  name: string;
  stackId: string;
  orgId: string;
}

export const selectEnvironmentsForTableSearch = createSelector(
  selectEnvironmentsAsList,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (envs, search): DeployEnvironment[] => {
    if (search === "") {
      return envs;
    }

    return envs
      .filter((env) => {
        const handleMatch = env.handle.toLocaleLowerCase().includes(search);
        return handleMatch;
      })
      .sort((a, b) => a.handle.localeCompare(b.handle));
  },
);

export const createDeployEnvironment = api.post<
  CreateEnvProps,
  DeployEnvironmentResponse
>("/accounts", function* (ctx, next) {
  const { name, stackId, orgId } = ctx.payload;
  const body = {
    handle: name,
    stack_id: stackId,
    organization_id: orgId,
    type: "development",
  };
  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield next();
});

export const environmentEntities = {
  account: defaultEntity({
    id: "account",
    deserialize: deserializeDeployEnvironment,
    save: addDeployEnvironments,
  }),
};
