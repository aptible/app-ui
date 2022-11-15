import { defaultEntity, extractIdFromLink } from "@app/hal";
import type { AppState, DeployDatabase } from "@app/types";
import { api, cacheTimer, combinePages, PaginateProps, thunks } from "@app/api";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";

import { deserializeOperation } from "../operation";
import { deserializeDisk } from "../disk";
import { selectDeploy } from "../slice";
import { createSelector } from "@reduxjs/toolkit";
import { findEnvById, selectEnvironments } from "../environment";

export const deserializeDeployDatabase = (payload: any): DeployDatabase => {
  const embedded = payload._embedded;
  const links = payload._links;

  return {
    connectionUrl: payload.connectionUrl,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    currentKmsArn: payload.current_kms_arn,
    dockerRepo: payload.docker_repo,
    handle: payload.handle,
    id: payload.id,
    provisioned: payload.provisioned,
    type: payload.type,
    status: payload.status,
    environmentId: extractIdFromLink(links.account),
    serviceId: extractIdFromLink(links.service),
    disk: deserializeDisk(embedded.disk),
    lastOperation: deserializeOperation(embedded.last_operation),
  };
};

export const defaultDeployDatabase = (
  d: Partial<DeployDatabase> = {},
): DeployDatabase => {
  const now = new Date().toISOString();
  return {
    id: "",
    status: "pending",
    handle: "",
    connectionUrl: "",
    createdAt: now,
    updatedAt: now,
    currentKmsArn: "",
    dockerRepo: "",
    provisioned: false,
    type: "",
    environmentId: "",
    serviceId: "",
    disk: null,
    lastOperation: null,
    ...d,
  };
};

export interface DeployDatabaseRow extends DeployDatabase {
  envHandle: string;
}

export const DEPLOY_DATABASE_NAME = "databases";
const slice = createTable<DeployDatabase>({
  name: DEPLOY_DATABASE_NAME,
});
const { add: addDeployDatabases } = slice.actions;

export const hasDeployDatabase = (a: DeployDatabase) => a.id !== "";
export const databaseReducers = createReducerMap(slice);
const initApp = defaultDeployDatabase();
const must = mustSelectEntity(initApp);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_DATABASE_NAME],
);
export const selectDatabaseById = must(selectors.selectById);
export const { selectTableAsList: selectDatabasesAsList } = selectors;

export const selectDatabasesForTable = createSelector(
  selectDatabasesAsList,
  selectEnvironments,
  (dbs, envs) =>
    dbs
      .map((db): DeployDatabaseRow => {
        const env = findEnvById(envs, { id: db.environmentId });
        return { ...db, envHandle: env.handle };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle)),
);

const selectSearchProp = (_: AppState, props: { search: string }) =>
  props.search.toLocaleLowerCase();

export const selectDatabasesForTableSearch = createSelector(
  selectDatabasesForTable,
  selectSearchProp,
  (dbs, search): DeployDatabaseRow[] => {
    if (search === "") {
      return dbs;
    }

    return dbs.filter((db) => {
      const handle = db.handle.toLocaleLowerCase();
      const envHandle = db.envHandle.toLocaleLowerCase();
      const dbType = db.type.toLocaleLowerCase();

      let lastOpUser = "";
      let lastOpType = "";
      let lastOpStatus = "";
      if (db.lastOperation) {
        lastOpUser = db.lastOperation.userName.toLocaleLowerCase();
        lastOpType = db.lastOperation.type.toLocaleLowerCase();
        lastOpStatus = db.lastOperation.status.toLocaleLowerCase();
      }

      const handleMatch = handle.includes(search);
      const envMatch = envHandle.includes(search);
      const userMatch = lastOpUser !== "" && lastOpUser.includes(search);
      const opMatch = lastOpType !== "" && lastOpType.includes(search);
      const opStatusMatch =
        lastOpStatus !== "" && lastOpStatus.includes(search);
      const dbTypeMatch = dbType.includes(search);

      return (
        handleMatch ||
        dbTypeMatch ||
        envMatch ||
        opMatch ||
        opStatusMatch ||
        userMatch
      );
    });
  },
);

export const fetchDatabases = api.get<PaginateProps>("/databases?page=:page", {
  saga: cacheTimer(),
});
export const fetchAllDatabases = thunks.create(
  "fetch-all-databases",
  { saga: cacheTimer() },
  combinePages(fetchDatabases),
);

export const fetchDatabase = api.get<{ id: string }>("/databases/:id", {
  saga: cacheTimer(),
});
export const fetchDatabaseOperations = api.get<{ id: string }>(
  "/databases/:id/operations",
  { saga: cacheTimer() },
  api.cache(),
);
export const fetchDatabaseBackups = api.get<{ id: string }>(
  "/databases/:id/backups",
  { saga: cacheTimer() },
  api.cache(),
);

export const databaseEntities = {
  database: defaultEntity({
    id: "database",
    deserialize: deserializeDeployDatabase,
    save: addDeployDatabases,
  }),
};
