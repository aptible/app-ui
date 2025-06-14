import {
  type ThunkCtx,
  api,
  cacheMinTimer,
  thunkLoader,
  thunks,
} from "@app/api";
import { type FetchJson, type Payload, call, parallel, select } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  selectOrganizationSelected,
  selectOrganizationSelectedId,
} from "@app/organizations";
import { DEFAULT_INSTANCE_CLASS, type WebState, schema } from "@app/schema";
import { capitalize } from "@app/string-utils";
import { tunaEvent } from "@app/tuna";
import type {
  DeployApiCtx,
  DeployDatabase,
  DeployOperation,
  HalEmbedded,
  InstanceClass,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironments,
  selectEnvironmentsByOrg,
} from "../environment";
import {
  type DeployOperationResponse,
  selectOperationsByDatabaseId,
  waitForOperation,
} from "../operation";
import { selectServiceById } from "../service";

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
  enable_backups: boolean;
  port_mapping: [number, number][];
  _links: {
    account: LinkResponse;
    service: LinkResponse;
    database_image: LinkResponse;
    initialize_from: LinkResponse;
    disk: LinkResponse;
  };
  _embedded: {
    disk: any;
    last_operation: any;
  };
  _type: "database";
}

export interface DbCreatorProps {
  id: string;
  imgId: string;
  name: string;
  env: string;
  dbType: string;
  enableBackups: boolean;
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
    enable_backups: true,
    port_mapping: [],
    _links: {
      account: { href: "" },
      service: { href: "" },
      database_image: { href: "" },
      initialize_from: { href: "" },
      disk: { href: "" },
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
    enableBackups: payload.enable_backups,
    type: payload.type,
    status: payload.status,
    portMapping: payload.port_mapping,
    databaseImageId: extractIdFromLink(links.database_image),
    environmentId: extractIdFromLink(links.account),
    serviceId: extractIdFromLink(links.service),
    diskId: extractIdFromLink(links.disk),
    initializeFrom: extractIdFromLink(links.initialize_from),
  };
};

export interface DeployDatabaseRow extends DeployDatabase {
  envHandle: string;
  lastOperation: DeployOperation;
  cost: number;
  diskSize: number;
  containerSize: number;
  imageDesc: string;
  savings: number;
}

export const hasDeployDatabase = (a: DeployDatabase) => a.id !== "";
export const selectDatabaseById = schema.databases.selectById;
export const selectDatabasesAsList = schema.databases.selectTableAsList;
export const selectDatabases = schema.databases.selectTable;
export const findDatabaseById = schema.databases.findById;

export const selectDatabaseByHandle = createSelector(
  selectDatabasesAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  (_: WebState, p: { handle: string }) => p.handle,
  (dbs, envId, handle) => {
    const dbFound = dbs.find((db) => {
      return db.environmentId === envId && db.handle === handle;
    });

    return dbFound || schema.databases.empty;
  },
);

export const selectDatabasesByOrgAsList = createSelector(
  selectDatabasesAsList,
  selectEnvironmentsByOrg,
  selectOrganizationSelectedId,
  (dbs, envs) => {
    return dbs.filter((db) => {
      const env = findEnvById(envs, { id: db.environmentId });
      return hasDeployEnvironment(env);
    });
  },
);

export const selectDatabasesByEnvId = createSelector(
  selectDatabasesAsList,
  (_: WebState, props: { envId: string }) => props.envId,
  (dbs, envId) => {
    return dbs
      .filter((db) => db.environmentId === envId)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);

export const selectDatabasesByEnvIdAndType = createSelector(
  selectDatabasesByEnvId,
  (_: WebState, props: { envId: string }) => props.envId,
  (_: WebState, props: { types: string[] }) => props.types,
  (dbs, envId, types) => {
    return dbs
      .filter((db) => db.environmentId === envId)
      .filter((db) => types.includes(db.type))
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);

export const selectDatabasesByStack = createSelector(
  selectDatabasesAsList,
  selectEnvironments,
  (_: WebState, p: { stackId: string }) => p.stackId,
  (dbs, envs, stackId) => {
    return dbs.filter((db) => {
      const env = findEnvById(envs, { id: db.environmentId });
      return env.stackId === stackId;
    });
  },
);

export const fetchDatabases = api.get(
  "/databases?per_page=5000&no_embed=true",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.databases.reset());
  },
);

export const fetchDatabase = api.get<{ id: string }, DeployDatabaseResponse>(
  "/databases/:id",
);
export const fetchDatabasesByEnvId = api.get<
  { envId: string },
  HalEmbedded<{ databases: DeployDatabaseResponse[] }>
>("/accounts/:envId/databases");

export interface CreateDatabaseProps {
  handle: string;
  type: string;
  envId: string;
  databaseImageId: string;
  enableBackups: boolean;
  diskSize?: number;
  iops?: number;
  containerProfile?: InstanceClass;
  containerSize?: number;
}
/**
 * This will only create a database record, it will not trigger it to actually be provisioned.
 * You probably want to just use `provisionDatabase` which will create and provision the database.
 */
export const createDatabase = api.post<
  CreateDatabaseProps,
  DeployDatabaseResponse
>("/accounts/:envId/databases", function* (ctx, next) {
  const { handle, type, envId, databaseImageId, enableBackups } = ctx.payload;
  const body = {
    handle,
    type,
    account_id: envId,
    database_image_id: databaseImageId,
    enable_backups: enableBackups,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });

  yield* next();
});

interface CreateDbResult {
  error: string;
  dbCtx:
    | null
    | (Omit<DeployApiCtx<any, any>, "payload" | "json"> &
        Payload<CreateDatabaseProps> &
        FetchJson<DeployDatabaseResponse, any>);
  dbId: string;
  opCtx:
    | null
    | (Omit<DeployApiCtx<any, any>, "payload" | "json"> &
        Payload<
          | ProvisionDatabaseOpProps
          | DeprovisionDatabaseOpProps
          | BackupDatabaseOpProps
          | PitrRestoreDatabaseOpProps
        > &
        FetchJson<DeployOperationResponse, any>);
}

export const mapCreatorToProvision = (
  envId: string,
  dbi: DbCreatorProps,
): CreateDatabaseProps => {
  const handle = dbi.name.toLocaleLowerCase();
  const dbType = dbi.dbType;
  const enableBackups = dbi.enableBackups;
  return {
    handle,
    type: dbType,
    envId,
    databaseImageId: dbi.imgId,
    enableBackups,
  };
};

export const provisionDatabaseList = thunks.create<{
  envId: string;
  dbs: DbCreatorProps[];
}>("database-list-provision", function* (ctx, next) {
  const { dbs, envId } = ctx.payload;
  const id = ctx.key;
  yield* schema.update(schema.loaders.start({ id }));
  const group = yield* parallel(
    dbs.map((db) => {
      return () =>
        provisionDatabase.run(
          provisionDatabase(mapCreatorToProvision(envId, db)),
        );
    }),
  );
  const results = yield* group;

  const errors = [];
  for (let i = 0; i < results.length; i += 1) {
    const res = results[i];
    if (!res.ok) continue;
    const json = res.value.json;
    if (!json) continue;

    if (json.error) {
      errors.push(json.error);
      continue;
    }

    const { opCtx, dbCtx } = json;
    if (opCtx && !opCtx.json.ok) {
      errors.push(opCtx.json.error.message);
      continue;
    }

    if (dbCtx && !dbCtx.json.ok) {
      errors.push(dbCtx.json.error.message);
    }
  }

  if (errors.length > 0) {
    yield* schema.update(
      schema.loaders.error({ id, message: errors.join(", ") }),
    );
    return;
  }

  yield* schema.update(schema.loaders.success({ id }));
  yield* next();
});

export const provisionDatabase = thunks.create<
  CreateDatabaseProps,
  ThunkCtx<CreateDatabaseProps, CreateDbResult>
>("database-provision", function* (ctx, next) {
  yield* schema.update(schema.loaders.start({ id: ctx.key }));

  const dbAlreadyExists = yield* select((s: WebState) =>
    selectDatabaseByHandle(s, {
      handle: ctx.payload.handle,
      envId: ctx.payload.envId,
    }),
  );

  let dbId = dbAlreadyExists.id;
  let dbCtx = null;
  if (!hasDeployDatabase(dbAlreadyExists)) {
    dbCtx = yield* call(() => createDatabase.run(createDatabase(ctx.payload)));

    if (!dbCtx.json.ok) {
      const data = dbCtx.json.error;
      const message = data.message;
      yield* schema.update(schema.loaders.error({ id: ctx.key, message }));
      ctx.json = {
        error: message,
        dbId,
        dbCtx: null,
        opCtx: null,
      };
      return;
    }

    dbId = `${dbCtx.json.value.id}`;
  }

  yield* next();

  const dbOps = yield* select((s: WebState) =>
    selectOperationsByDatabaseId(s, { dbId }),
  );
  const alreadyProvisioned = dbOps.find((op) => op.type === "provision");
  if (alreadyProvisioned) {
    const message = `Database (${ctx.payload.handle}) already provisioned`;
    yield* schema.update(schema.loaders.success({ id: ctx.key, message }));
    ctx.json = {
      error: message,
      dbId,
      dbCtx: null,
      opCtx: null,
    };
    return;
  }

  const opCtx = yield* call(
    createDatabaseOperation.run(
      createDatabaseOperation({
        dbId,
        iops: ctx.payload.iops || 3000,
        containerProfile:
          ctx.payload.containerProfile || DEFAULT_INSTANCE_CLASS,
        containerSize: ctx.payload.containerSize || 1024,
        diskSize: ctx.payload.diskSize || 10,
        type: "provision",
      }),
    ),
  );

  ctx.json = {
    dbCtx,
    opCtx,
    dbId,
    error: "",
  };

  if (!opCtx.json.ok) {
    const data = opCtx.json.error;
    yield* schema.update(
      schema.loaders.error({ id: ctx.key, message: data.message }),
    );
    return;
  }

  yield* schema.update(
    schema.loaders.success({
      id: ctx.key,
      meta: { dbId, opId: opCtx.json.value.id } as any,
    }),
  );
});

interface ProvisionDatabaseOpProps {
  dbId: string;
  type: "provision";
  containerSize?: number;
  diskSize?: number;
  containerProfile?: InstanceClass;
  iops?: number;
  recoveryTargetType?: string;
  recoveryTarget?: string;
}

interface DeprovisionDatabaseOpProps {
  dbId: string;
  type: "deprovision";
}

interface BackupDatabaseOpProps {
  dbId: string;
  type: "backup";
}

interface PitrRestoreDatabaseOpProps {
  // TODO: Allow disk size properties
  dbId: string;
  type: "pitr_restore";
  handle: string;
  recoveryTargetType: string;
  recoveryTarget?: string;
}

export const createDatabaseOperation = api.post<
  | ProvisionDatabaseOpProps
  | DeprovisionDatabaseOpProps
  | BackupDatabaseOpProps
  | PitrRestoreDatabaseOpProps,
  DeployOperationResponse
>("/databases/:dbId/operations", function* (ctx, next) {
  const { type } = ctx.payload;
  const getBody = () => {
    switch (type) {
      case "deprovision": {
        return { type };
      }

      case "backup": {
        return { type };
      }

      case "provision": {
        const {
          containerSize,
          diskSize,
          iops,
          containerProfile,
          recoveryTargetType,
          recoveryTarget,
        } = ctx.payload;
        return {
          container_size: containerSize,
          disk_size: diskSize,
          provisioned_iops: iops,
          instance_profile: containerProfile,
          recovery_target_type: recoveryTargetType,
          recovery_target: recoveryTarget,
          type,
        };
      }

      case "pitr_restore": {
        const { handle, recoveryTargetType, recoveryTarget } = ctx.payload;
        return {
          type,
          handle,
          recovery_target_type: recoveryTargetType,
          recovery_target: recoveryTarget,
        };
      }

      default:
        return {};
    }
  };
  const body = getBody();
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
});

export const fetchDatabaseDependents = api.get<{ id: string }>(
  "/databases/:id/dependents",
);

export const selectDatabaseDependents = createSelector(
  selectDatabasesAsList,
  (_: WebState, props: { id: string }) => props.id,
  (dbs, id) =>
    dbs
      .filter((db): boolean => db.initializeFrom === id)
      .sort((a, b) => a.id.localeCompare(b.id)), // sort them to ensure an idempotent order
);

export const databaseEntities = {
  database: defaultEntity({
    id: "database",
    deserialize: deserializeDeployDatabase,
    save: schema.databases.add,
  }),
};

export const deprovisionDatabase = thunks.create<{
  dbId: string;
}>("deprovision-database", [
  thunkLoader,
  function* (ctx, next) {
    const { dbId } = ctx.payload;

    const deprovisionCtx = yield* call(() =>
      createDatabaseOperation.run(
        createDatabaseOperation({
          type: "deprovision",
          dbId,
        }),
      ),
    );

    if (!deprovisionCtx.json.ok) {
      throw new Error(deprovisionCtx.json.error.message);
    }
    const data = deprovisionCtx.json.value;
    yield* call(() => waitForOperation({ id: `${data.id}` }));
    yield* next();
  },
]);

interface UnlinkDatabase {
  id: string;
}

export const unlinkDatabase = api.post<UnlinkDatabase>(
  "/databases/:id/unlink",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = {
      message:
        "Replica unlinked from source successfully! This action does not stop replication.",
    };
  },
);

interface UpdateDatabase {
  id: string;
  handle: string;
  enableBackups: boolean;
}

export const updateDatabase = api.put<UpdateDatabase>(
  "/databases/:id",
  function* (ctx, next) {
    const { handle, enableBackups } = ctx.payload;
    const body = {
      handle,
      enable_backups: enableBackups,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = {
      message: "Saved changes successfully!",
    };
  },
);

export interface DatabaseScaleProps {
  id: string;
  diskSize?: number;
  containerSize?: number;
  containerProfile?: InstanceClass;
  recId?: string;
  originalValues: DatabaseScaleOriginal;
}

export interface DatabaseScaleOriginal {
  diskSize?: number;
  containerSize?: number;
  containerProfile?: InstanceClass;
}

export const restartDatabase = api.post<
  { id: string },
  DeployOperationResponse
>(["/databases/:id/operations", "restart"], function* (ctx, next) {
  const { id } = ctx.payload;
  const body = {
    type: "restart",
    id,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Restart database operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const restartRecreateDatabase = api.post<
  { id: string; containerProfile: InstanceClass },
  DeployOperationResponse
>(["/databases/:id/operations", "restart_recreate"], function* (ctx, next) {
  const { id, containerProfile } = ctx.payload;
  const body = {
    type: "restart_recreate",
    id,
    instance_profile: containerProfile,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Restart database with disk move operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const scaleDatabase = api.post<
  DatabaseScaleProps,
  DeployOperationResponse
>(["/databases/:id/operations", "scale"], function* (ctx, next) {
  const {
    id,
    diskSize,
    containerProfile,
    containerSize,
    recId = "",
    originalValues,
  } = ctx.payload;
  const db = yield* select((s: WebState) => selectDatabaseById(s, { id }));
  const service = yield* select((s: WebState) =>
    selectServiceById(s, { id: db.serviceId }),
  );
  const org = yield* select(selectOrganizationSelected);
  const body = {
    type: "restart",
    id,
    disk_size: 0 as number | undefined,
    container_size: containerSize,
    instance_profile: containerProfile,
  };
  if (originalValues.diskSize !== diskSize) {
    body.disk_size = diskSize;
  }
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;

  if (recId !== "") {
    const rec = yield* select((s: WebState) =>
      schema.manualScaleRecommendations.selectById(s, { id: recId }),
    );
    tunaEvent(
      "scale-service-with-recommendation",
      JSON.stringify({
        orgId: org.id,
        orgName: org.name,
        databaseId: id,
        serviceId: service.id,
        opId: ctx.json.value.id,
        costSavings: rec.costSavings,
        curContainerProfile: service.instanceClass,
        curContainersize: service.containerMemoryLimitMb,
        recContainerProfile: rec.recommendedInstanceClass,
        recContainerSize: rec.recommendedContainerMemoryLimitMb,
        appliedContainerProfile: containerProfile,
        appliedContainerSize: containerSize,
      }),
    );
  }

  ctx.loader = {
    message: `Restart (and scale) database operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export interface PitrRestoreDatabaseProps {
  // TODO: Add container and disk options
  dbId: string;
  handle: string;
  recoveryTargetType: string;
  recoveryTarget?: string;
}

export const pitrRestoreDatabase = thunks.create<
  PitrRestoreDatabaseProps,
  ThunkCtx<PitrRestoreDatabaseProps, { databaseId: string }>
>("pitr-restore-database", function* (ctx, next) {
  yield* schema.update(schema.loaders.start({ id: ctx.key }));

  const { dbId, handle, recoveryTargetType, recoveryTarget } = ctx.payload;
  const db = yield* select((s: WebState) =>
    selectDatabaseById(s, { id: dbId }),
  );

  // PITR involves two operations, first pitr_restore to create the new
  // database in the API with a restored disk, then provision to perform setup
  // and recovery
  const restoreCtx = yield* call(() =>
    createDatabaseOperation.run(
      createDatabaseOperation({
        dbId,
        type: "pitr_restore",
        handle,
        recoveryTargetType,
        recoveryTarget,
      }),
    ),
  );

  if (!restoreCtx.json.ok) {
    yield* schema.update(
      schema.loaders.error({
        id: ctx.key,
        message: restoreCtx.json.error.message,
      }),
    );
    return;
  }

  const restoreData = restoreCtx.json.value;
  // TODO: POnly wait for the expected database, not the operation to complete.
  // The operation could take a while and we can immediately enqueue the
  // provision once the database is created, it will wait for the restore.
  const res = yield* call(() => waitForOperation({ id: `${restoreData.id}` }));

  if (res?.status !== "succeeded") {
    yield* schema.update(
      schema.loaders.error({
        id: ctx.key,
        message: `Operation ${restoreData.id} did not succeed`,
      }),
    );
    return;
  }

  // Fetch databases in the environment to make sure the new one is loaded
  yield* call(() =>
    fetchDatabasesByEnvId.run(
      fetchDatabasesByEnvId({ envId: db.environmentId }),
    ),
  );
  const newDb = yield* select((s: WebState) =>
    selectDatabaseByHandle(s, { envId: db.environmentId, handle }),
  );

  const provisionCtx = yield* call(
    createDatabaseOperation.run(
      createDatabaseOperation({
        dbId: newDb.id,
        type: "provision",
        recoveryTargetType,
        recoveryTarget,
      }),
    ),
  );

  if (!provisionCtx.json.ok) {
    yield* schema.update(
      schema.loaders.error({
        id: ctx.key,
        message: provisionCtx.json.error.message,
      }),
    );
    return;
  }

  yield* schema.update(schema.loaders.success({ id: ctx.key }));
  yield* next();
});

export const formatDatabaseType = (type: string, version: string) => {
  return `${capitalize(type)} ${version}`;
};
