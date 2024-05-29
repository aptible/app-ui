import { type PaginateProps, api } from "@app/api";
import { poll } from "@app/fx";
import { createAction, createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import { dateDescSort } from "@app/sort";
import type { DeployBackup, HalEmbedded, LinkResponse } from "@app/types";
import { selectDatabases } from "../database";
import type { DeployOperationResponse } from "../operation";

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

export const selectBackupById = schema.backups.selectById;
export const selectBackupsByIds = schema.backups.selectByIds;
export const selectBackupsAsList = schema.backups.selectTableAsList;
export const selectBackups = schema.backups.selectTable;

export const selectBackupsByEnvId = createSelector(
  selectBackupsAsList,
  (_: WebState, p: { envId: string }) => p.envId,
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
  (_: WebState, p: { dbId: string }) => p.dbId,
  (backups, envId) =>
    backups.filter((bk) => bk.databaseId === envId).sort(dateDescSort),
);

export const backupEntities = {
  backup: defaultEntity({
    id: "backup",
    deserialize: deserializeDeployBackup,
    save: schema.backups.add,
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
  yield* schema.update(schema.cache.add({ [ctx.key]: paginatedData }));
});

export const fetchBackup = api.get<{ id: string }>("/backups/:id");

export const fetchBackupsByEnvironmentId = api.get<
  {
    id: string;
    orphaned: boolean;
  } & PaginateProps,
  HalEmbedded<{ backups: BackupResponse[] }>
>("/accounts/:id/backups?page=:page", function* (ctx, next) {
  if (ctx.payload.orphaned) {
    ctx.request = ctx.req({
      url: `${ctx.req().url}&orphaned=true`,
    });
  }

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.backups.map((bk) => `${bk.id}`);
  const paginatedData = { ...ctx.json.value, _embedded: { backups: ids } };
  yield* schema.update(schema.cache.add({ [ctx.key]: paginatedData }));
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

    const opId = ctx.json.value.id;
    ctx.loader = {
      message: `Backup operation queued (operation ID: ${opId})`,
      meta: { opId: `${opId}` },
    };
    yield* schema.update(schema.backups.remove([ctx.payload.id]));
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

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Restore from Backup operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});
