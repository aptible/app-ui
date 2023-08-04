import { createSelector } from "@reduxjs/toolkit";

import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import {
  AppState,
  DeployBackup,
  DeployOperationResponse,
  LinkResponse,
} from "@app/types";

import { selectDeploy } from "../slice";

export interface BackupResponse {
  id: number;
  aws_region: string;
  created_by_email: string;
  manual: boolean;
  size: number;
  created_at: string;
  _embedded: {
    copied_from?: {
      id: number;
    };
  };
  _links: {
    account: LinkResponse;
    copies: LinkResponse;
    created_from_operation: LinkResponse;
    database: LinkResponse;
    database_image: LinkResponse;
    operations: LinkResponse;
  };
  _type: "backup";
}

export interface HalBackups {
  backups: BackupResponse[];
}

export const defaultDeployBackup = (
  b: Partial<DeployBackup> = {},
): DeployBackup => {
  const now = new Date().toISOString();
  return {
    id: "",
    awsRegion: "",
    createdByEmail: "",
    databaseId: "",
    environmentId: "",
    createdFromOperationId: "",
    copiedFromId: "",
    size: 0,
    manual: false,
    createdAt: now,
    ...b,
  };
};

export const deserializeDeployBackup = (b: BackupResponse): DeployBackup => {
  return {
    id: `${b.id}`,
    awsRegion: b.aws_region,
    createdByEmail: b.created_by_email,
    copiedFromId: `${b._embedded.copied_from?.id}` || "",
    size: b.size,
    manual: b.manual,
    createdAt: b.created_at,
    databaseId: extractIdFromLink(b._links.database),
    environmentId: extractIdFromLink(b._links.account),
    createdFromOperationId: extractIdFromLink(b._links.created_from_operation),
  };
};

export const DEPLOY_BACKUP_NAME = "backups";
const slice = createTable<DeployBackup>({ name: DEPLOY_BACKUP_NAME });
export const { add: addDeployBackups } = slice.actions;
export const hasDeployBackup = (a: DeployBackup) => a.id !== "";
export const backupReducers = createReducerMap(slice);

const initBackup = defaultDeployBackup();
const must = mustSelectEntity(initBackup);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_BACKUP_NAME],
);
export const selectBackupById = must(selectors.selectById);
export const {
  selectTableAsList: selectBackupsAsList,
  selectTable: selectBackups,
} = selectors;

export const selectBackupsByEnvId = createSelector(
  selectBackupsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (backups, envId) => backups.filter((bk) => bk.environmentId === envId),
);

export const selectBackupsByDatabaseId = createSelector(
  selectBackupsAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  (backups, envId) => backups.filter((bk) => bk.databaseId === envId),
);

export const backupEntities = {
  backup: defaultEntity({
    id: "backup",
    deserialize: deserializeDeployBackup,
    save: addDeployBackups,
  }),
};

export const fetchDatabaseBackups = api.get<{ id: string }>(
  "/databases/:id/backups",
);
export const fetchDatabaseBackupsByEnvironment = api.get<{ id: string }>(
  "/accounts/:id/backups",
);
export const deleteBackup = api.post<{ id: string }, DeployOperationResponse>(
  "/backups/:id/operations",
  function* (ctx, next) {
    const body = {
      type: "purge",
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const opId = ctx.json.data.id;
    ctx.loader = {
      message: `Backup operation queued (operation ID: ${opId})`,
      meta: { opId: `${opId}` },
    };
  },
);
