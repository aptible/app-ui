import {
  FetchJson,
  Payload,
  call,
  poll,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

import {
  PaginateProps,
  ThunkCtx,
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
import type {
  AppState,
  DeployApiCtx,
  DeployDatabase,
  DeployOperationResponse,
  HalEmbedded,
  LinkResponse,
  OperationStatus,
  ProvisionableStatus,
} from "@app/types";

import { deserializeDisk } from "../disk";
import { findEnvById, selectEnvironments } from "../environment";
import {
  deserializeDeployOperation,
  selectOperationsByDatabaseId,
  waitForOperation,
} from "../operation";
import { selectDeploy } from "../slice";
import { createAction, createSelector } from "@reduxjs/toolkit";

export interface DeployDatabaseResponse {
  id: number;
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
    database_image: LinkResponse;
    initialize_from: LinkResponse;
  };
  _embedded: {
    disk: any;
    last_operation: any;
  };
  _type: "database";
}

export interface BackupResponse {
  id: number;
  aws_region: string;
  created_by_email: string;
  manual: boolean;
  size: number;
  _embedded: {
    copied_from?: {
      id: number;
    };
  };
  created_at: string;
}

export interface HalBackups {
  backups: BackupResponse[];
}

export const defaultDatabaseResponse = (
  d: Partial<DeployDatabaseResponse> = {},
): DeployDatabaseResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    handle: "",
    provisioned: true,
    type: "",
    status: "provisioned",
    docker_repo: "",
    current_kms_arn: "",
    connection_url: "",
    created_at: now,
    updated_at: now,
    _links: {
      account: { href: "" },
      service: { href: "" },
      database_image: { href: "" },
      initialize_from: { href: "" },
      ...d._links,
    },
    _embedded: {
      disk: null,
      last_operation: null,
      ...d._embedded,
    },
    _type: "database",
    ...d,
  };
};

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
    id: `${payload.id}`,
    provisioned: payload.provisioned,
    type: payload.type,
    status: payload.status,
    databaseImageId: extractIdFromLink(links.database_image),
    environmentId: extractIdFromLink(links.account),
    serviceId: extractIdFromLink(links.service),
    disk: embedded.disk ? deserializeDisk(embedded.disk) : null,
    initializeFrom: extractIdFromLink(links.initialize_from),
    lastOperation: embedded.last_operation
      ? deserializeDeployOperation(embedded.last_operation)
      : null,
  };
};

export const defaultDeployDatabase = (
  d: Partial<DeployDatabase> = {},
): DeployDatabase => {
  const now = new Date().toISOString();
  return {
    id: "",
    databaseImageId: "",
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
    initializeFrom: "",
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
const initDb = defaultDeployDatabase();
const must = mustSelectEntity(initDb);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_DATABASE_NAME],
);
export const selectDatabaseById = must(selectors.selectById);
export const {
  selectTableAsList: selectDatabasesAsList,
  selectTable: selectDatabases,
} = selectors;
export const findDatabaseById = must(selectors.findById);

export const selectDatabaseByHandle = createSelector(
  selectDatabasesAsList,
  (_: AppState, p: { handle: string }) => p.handle,
  (dbs, handle) => dbs.find((db) => db.handle === handle) || initDb,
);

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

export const selectDatabasesByEnvId = createSelector(
  selectDatabasesAsList,
  (_: AppState, props: { envId: string }) => props.envId,
  (dbs, envId) => {
    return dbs
      .filter((db) => db.environmentId === envId)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);

export const fetchDatabases = api.get<PaginateProps>("/databases?page=:page", {
  saga: cacheTimer(),
});
export const fetchAllDatabases = thunks.create(
  "fetch-all-databases",
  combinePages(fetchDatabases),
);
export const fetchDatabase = api.get<{ id: string }, DeployDatabaseResponse>(
  "/databases/:id",
);
export const fetchDatabasesByEnvId = api.get<
  { envId: string },
  HalEmbedded<{ databases: DeployDatabaseResponse[] }>
>("/accounts/:envId/databases");

interface CreateDatabaseProps {
  handle: string;
  type: string;
  envId: string;
  databaseImageId: string;
}
/**
 * This will only create a database record, it will not trigger it to actually be provisioned.
 * You probably want to just use `provisionDatabase` which will create and provision the database.
 */
export const createDatabase = api.post<
  CreateDatabaseProps,
  DeployDatabaseResponse
>("/accounts/:envId/databases", function* (ctx, next) {
  const { handle, type, envId, databaseImageId } = ctx.payload;
  const body = {
    handle,
    type,
    account_id: envId,
    database_image_id: databaseImageId,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });

  yield next();
});

interface CreateDbResult {
  dbCtx:
    | null
    | (Omit<DeployApiCtx<any, any>, "payload" | "json"> &
        Payload<CreateDatabaseProps> &
        FetchJson<DeployDatabaseResponse, any>);
  dbId: string;
  opCtx: Omit<DeployApiCtx<any, any>, "payload" | "json"> &
    Payload<CreateDatabaseOpProps | DeprovisionDatabaseOpProps> &
    FetchJson<DeployOperationResponse, any>;
}

export const provisionDatabase = thunks.create<
  CreateDatabaseProps,
  ThunkCtx<CreateDatabaseProps, CreateDbResult>
>("database-provision", function* (ctx, next) {
  yield put(setLoaderStart({ id: ctx.key }));

  const dbAlreadyExists = yield* select(selectDatabaseByHandle, {
    handle: ctx.payload.handle,
  });

  let dbId = dbAlreadyExists.id;
  let dbCtx = null;
  if (!hasDeployDatabase(dbAlreadyExists)) {
    dbCtx = yield* call(createDatabase.run, createDatabase(ctx.payload));

    if (!dbCtx.json.ok) {
      yield put(
        setLoaderError({ id: ctx.key, message: dbCtx.json.data.message }),
      );
      return;
    }

    dbId = `${dbCtx.json.data.id}`;
  }

  yield next();

  const dbOps = yield* select(selectOperationsByDatabaseId, { dbId });
  const alreadyProvisioned = dbOps.find((op) => op.type === "provision");
  if (alreadyProvisioned) {
    return;
  }

  const opCtx = yield* call(
    createDatabaseOperation.run,
    createDatabaseOperation({
      dbId,
      containerSize: 1024,
      diskSize: 10,
      status: "queued",
      type: "provision",
      envId: ctx.payload.envId,
    }),
  );

  ctx.json = {
    dbCtx,
    opCtx,
    dbId,
  };

  if (!opCtx.json.ok) {
    yield put(
      setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
    );
    return;
  }

  yield put(
    setLoaderSuccess({
      id: ctx.key,
      meta: { dbId, opId: opCtx.json.data.id },
    }),
  );
});

interface CreateDatabaseOpProps {
  dbId: string;
  containerSize: number;
  diskSize: number;
  type: "provision";
  envId: string;
  status: OperationStatus;
}

interface DeprovisionDatabaseOpProps {
  dbId: string;
  type: "deprovision";
}

export const createDatabaseOperation = api.post<
  CreateDatabaseOpProps | DeprovisionDatabaseOpProps,
  DeployOperationResponse
>("/databases/:dbId/operations", function* (ctx, next) {
  const { type } = ctx.payload;
  const getBody = () => {
    switch (type) {
      case "deprovision": {
        return { type };
      }

      case "provision": {
        const { containerSize, diskSize, type, status } = ctx.payload;
        return {
          container_size: containerSize,
          disk_size: diskSize,
          type,
          status,
        };
      }

      default:
        return {};
    }
  };
  const body = getBody();
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield next();
});

export const fetchDatabaseOperations = api.get<{ id: string }>(
  "/databases/:id/operations",
  { saga: cacheTimer() },
  api.cache(),
);

export const cancelDatabaseOpsPoll = createAction("cancel-db-ops-poll");
export const pollDatabaseOperations = api.get<{ id: string }>(
  ["/databases/:id/operations", "poll"],
  { saga: poll(5 * 1000, `${cancelDatabaseOpsPoll}`) },
  api.cache(),
);

export const fetchDatabaseBackups = api.get<{ id: string }>(
  "/databases/:id/backups",
  { saga: cacheTimer() },
  api.cache(),
);
export const fetchDatabaseBackupsByEnvironment = api.get<{ id: string }>(
  "/accounts/:id/backups",
  { saga: cacheTimer() },
  api.cache(),
);

export const fetchDatabaseDependents = api.get<{ id: string }>(
  "/databases/:id/dependents",
  api.cache(),
);

export const selectDatabaseDependents = createSelector(
  selectDatabasesAsList,
  (_: AppState, props: { id: string }) => props.id,
  (dbs, id) =>
    dbs
      .filter((db): boolean => db.initializeFrom === id)
      .sort((a, b) => a.id.localeCompare(b.id)), // sort them to ensure an idempotent order
);

export const databaseEntities = {
  database: defaultEntity({
    id: "database",
    deserialize: deserializeDeployDatabase,
    save: addDeployDatabases,
  }),
};

export const deprovisionDatabase = thunks.create<{
  dbId: string;
}>("deprovision-database", function* (ctx, next) {
  const { dbId } = ctx.payload;
  yield* select(selectDatabaseById, { id: dbId });

  const deprovisionCtx = yield* call(
    createDatabaseOperation.run,
    createDatabaseOperation({
      type: "deprovision",
      dbId,
    }),
  );

  if (!deprovisionCtx.json.ok) return;
  yield* call(waitForOperation, { id: `${deprovisionCtx.json.data.id}` });
  yield next();
});

interface UpdateDatabase {
  id: string;
  handle: string;
}

export const updateDatabase = api.put<UpdateDatabase>(
  "/databases/:id",
  function* (ctx, next) {
    const { handle } = ctx.payload;
    const body = {
      handle,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield next();
  },
);
