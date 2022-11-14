import { createSelector } from "@reduxjs/toolkit";
import { api, cacheTimer } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { AppState, DeployEnvironment } from "@app/types";

import { selectDeploy } from "../slice";

export const deserializeDeployEnvironment = (
  payload: any,
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
  stackId: extractIdFromLink(payload._links.environment),
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
const initApp = defaultDeployEnvironment();
const must = mustSelectEntity(initApp);
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

export const fetchEnvironments = api.get("/accounts", { saga: cacheTimer() });
export const fetchEnvironment = api.get<{ id: string }>("/accounts/:id");

export const environmentEntities = {
  account: defaultEntity({
    id: "account",
    deserialize: deserializeDeployEnvironment,
    save: addDeployEnvironments,
  }),
};
