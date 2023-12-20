import { PaginateProps, api } from "@app/api";
import { addData, poll, put } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { dateDescSort } from "@app/sort";
import { AppState, DeployBackup, HalEmbedded, LinkResponse } from "@app/types";
import { createAction, createSelector } from "@reduxjs/toolkit";
import { selectDatabases } from "../database";
import { DeployOperationResponse } from "../operation";
import { selectDeploy } from "../slice";

export interface BackupResponse {
  id: number;
  aws_region: string;
  created_by_email: string;
  manual: boolean;
  size: number;
  created_at: string;
  database_handle: string;
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
    databaseHandle: "",
    ...b,
  };
};

export const deserializeDeployBackup = (b: BackupResponse): DeployBackup => {
  return {
    id: `${b.id}`,
    awsRegion: b.aws_region,
    createdByEmail: b.created_by_email,
    copiedFromId: `${b._embedded.copied_from?.id || ""}`,
    size: b.size,
    manual: b.manual,
    createdAt: b.created_at,
    databaseId: extractIdFromLink(b._links.database),
    environmentId: extractIdFromLink(b._links.account),
    createdFromOperationId: extractIdFromLink(b._links.created_from_operation),
    databaseHandle: b.database_handle,
  };
};

export const DEPLOY_BACKUP_NAME = "backups";
const slice = createTable<DeployBackup>({ name: DEPLOY_BACKUP_NAME });
export const { add: addDeployBackups, remove: removeDeployBackups } =
  slice.actions;
export const hasDeployBackup = (a: DeployBackup) => a.id !== "";
export const backupReducers = createReducerMap(slice);

const initBackup = defaultDeployBackup();
const must = mustSelectEntity(initBackup);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_BACKUP_NAME],
);
export const selectBackupById = must(selectors.selectById);
export const selectBackupsByIds = selectors.selectByIds;
export const {
  selectTableAsList: selectBackupsAsList,
  selectTable: selectBackups,
} = selectors;

export const selectBackupsByEnvId = createSelector(
  selectBackupsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (backups, envId) =>
    backups.filter((bk) => bk.environmentId === envId).sort(dateDescSort),
);

export const selectOrphanedBackupsByEnvId = createSelector(
  selectBackupsByEnvId,
  selectDatabases,
  (backups, databases) => {
    return backups.filter((backup) => {
      const db = databases[backup.databaseId];
      if (!db) return true;
      return false;
    });
  },
);

export const selectBackupsByDatabaseId = createSelector(
  selectBackupsAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  (backups, envId) =>
    backups.filter((bk) => bk.databaseId === envId).sort(dateDescSort),
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
export const cancelPollDatabaseBackups = createAction("cancel-poll-db-backups");
export const pollDatabaseBackups = api.get<{ id: string }>(
  ["/databases/:id/backups", "poll"],
  { supervisor: poll(10 * 1000, `${cancelPollDatabaseBackups}`) },
);

export const fetchBackupsByDatabaseId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ backups: BackupResponse[] }>
>("/databases/:id/backups?page=:page", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.backups.map((bk) => `${bk.id}`);
  const paginatedData = { ...ctx.json.value, _embedded: { backups: ids } };
  yield* put(addData({ [ctx.key]: paginatedData }));
});

export const fetchBackup = api.get<{ id: string }>("/backups/:id");

export const fetchBackupsByEnvironmentId = api.get<
  {
    id: string;
    orphaned: boolean;
  } & PaginateProps,
  HalEmbedded<{ backups: BackupResponse[] }>
>("/accounts/:id/backups", function* (ctx, next) {
  if (ctx.payload.orphaned) {
    ctx.request = ctx.req({
      url: `${ctx.req().url}?orphaned=true`,
    });
  }

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.backups.map((bk) => `${bk.id}`);
  const paginatedData = { ...ctx.json.value, _embedded: { backups: ids } };
  yield* put(addData({ [ctx.key]: paginatedData }));
});
export const deleteBackup = api.post<{ id: string }, DeployOperationResponse>(
  ["/backups/:id/operations", "delete"],
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
    ctx.actions.push(removeDeployBackups([ctx.payload.id]));
  },
);

export interface RestoreBackupProps {
  id: string;
  handle: string;
  destEnvId: string;
  diskSize?: number;
  containerSize?: number;
}

export const restoreBackup = api.post<
  RestoreBackupProps,
  DeployOperationResponse
>(["/backups/:id/operations", "restore"], function* (ctx, next) {
  const { handle, destEnvId, diskSize, containerSize } = ctx.payload;
  const body = {
    type: "restore",
    handle,
    destination_account_id: destEnvId,
    disk_size: diskSize || 10,
    containerSize: containerSize || 1024,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.data.id;
  ctx.loader = {
    message: `Restore from Backup operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});
