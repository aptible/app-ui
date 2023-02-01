import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

import { createLog } from "@app/debug";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import type {
  AppState,
  DeployDatabase,
  DeployOperationResponse,
  LinkResponse,
  OperationStatus,
  ProvisionableStatus,
} from "@app/types";
import {
  api,
  cacheTimer,
  combinePages,
  DeployApiCtx,
  PaginateProps,
  ThunkCtx,
  thunks,
} from "@app/api";
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

const log = createLog("database");

export interface DeployDatabaseResponse {
  id: string;
  handle: string;
  provisioned: boolean;
  type: string;
  status: ProvisionableStatus;
  docker_repo: string;
  current_kms_arn: string;
  connection_url: string;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
    service: LinkResponse;
  };
  _embedded: {
    disk: any;
    last_operation: any;
  };
}

export const deserializeDeployDatabase = (
  payload: DeployDatabaseResponse,
): DeployDatabase => {
  const embedded = payload._embedded;
  const links = payload._links;

  return {
    connectionUrl: payload.connection_url,
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
    disk: embedded.disk ? deserializeDisk(embedded.disk) : null,
    lastOperation: embedded.last_operation
      ? deserializeOperation(embedded.last_operation)
      : null,
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
interface CreateDatabaseProps {
  handle: string;
  type: string;
  envId: string;
  databaseImageId: string;
}
export type CreateDatabaseCtx = DeployApiCtx<
  DeployDatabaseResponse,
  CreateDatabaseProps
>;
/**
 * This will only create a database record, it will not trigger it to actually be provisioned.
 * You probably want to just use `provisionDatabase` which will create and provision the database.
 */
export const createDatabase = api.post<CreateDatabaseProps>(
  "/accounts/:envId/databases",
  function* (ctx: CreateDatabaseCtx, next) {
    const { handle, type, envId, databaseImageId } = ctx.payload;
    const body = {
      handle,
      type,
      account_id: envId,
      database_image_id: databaseImageId,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });

    yield next();
  },
);

export type ProvisionDatabaseCtx = ThunkCtx<
  CreateDatabaseProps,
  { dbCtx: CreateDatabaseCtx; opCtx: CreateDatabaseOpCtx }
>;
export const provisionDatabase = thunks.create<CreateDatabaseProps>(
  "database-provision",
  function* (ctx: ProvisionDatabaseCtx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    const dbCtx: CreateDatabaseCtx = yield call(
      createDatabase.run,
      createDatabase(ctx.payload),
    );

    if (!dbCtx.json.ok) {
      yield put(
        setLoaderError({ id: ctx.key, message: dbCtx.json.data.message }),
      );
      return;
    }

    yield next();

    const opCtx: CreateDatabaseOpCtx = yield call(
      createDatabaseOperation.run,
      createDatabaseOperation({
        dbId: dbCtx.json.data.id,
        containerSize: 1024,
        diskSize: 10,
        status: "queued",
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.json = {
      dbCtx,
      opCtx,
    };
    yield put(
      setLoaderSuccess({
        id: ctx.key,
        meta: { dbId: dbCtx.json.data.id, opId: opCtx.json.data.id },
      }),
    );
  },
);

interface CreateDatabaseOpProps {
  dbId: string;
  containerSize: number;
  diskSize: number;
  type: string;
  status: OperationStatus;
}
type CreateDatabaseOpCtx = DeployApiCtx<
  DeployOperationResponse,
  CreateDatabaseOpProps
>;
export const createDatabaseOperation = api.post<CreateDatabaseOpProps>(
  "/databases/:dbId/operations",
  function* (ctx: CreateDatabaseOpCtx, next) {
    const { containerSize, diskSize, type, status } = ctx.payload;
    const body = {
      container_size: containerSize,
      disk_size: diskSize,
      type,
      status,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield next();
  },
);

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
