import {
  PaginateProps,
  Retryable,
  api,
  cacheShortTimer,
  cacheTimer,
  combinePages,
  thunks,
} from "@app/api";
import {
  Next,
  Operation,
  call,
  createAction,
  createSelector,
  delay,
  mdw,
  poll,
  select,
  takeLeading,
} from "@app/fx";
import {
  defaultEntity,
  extractIdFromLink,
  extractResourceNameFromLink,
} from "@app/hal";
import {
  appDetailUrl,
  databaseDetailUrl,
  endpointDetailUrl,
} from "@app/routes";
import { WebState, defaultDeployOperation, schema } from "@app/schema";
import { capitalize } from "@app/string-utils";
import type {
  DeployActivityRow,
  DeployApiCtx,
  DeployOperation,
  HalEmbedded,
  LinkResponse,
  OperationStatus,
  OperationType,
  ResourceType,
} from "@app/types";
import { ServiceScaleProps, scaleAttrs, selectServiceById } from "../service";

export interface DeployOperationResponse {
  id: number;
  type: string;
  status: OperationStatus;
  created_at: string;
  updated_at: string;
  git_ref: string;
  docker_ref: string;
  container_count: number;
  container_size: number;
  disk_size: number;
  encrypted_env_json_new: string;
  destination_region: string;
  automated: boolean;
  cancelled: boolean;
  aborted: boolean;
  immediate: boolean;
  provisioned_iops: number;
  ebs_volume_type: string;
  encrypted_stack_settings: string;
  instance_profile: string;
  user_email: string;
  user_name: string;
  env: string;
  note: string;
  _links: {
    account: LinkResponse;
    code_scan_result: LinkResponse;
    ephemeral_sessions: LinkResponse;
    logs: LinkResponse;
    resource: LinkResponse;
    self: LinkResponse;
    ssh_portal_connections: LinkResponse;
    user: LinkResponse;
  };
  _type: "operation";
}

export const defaultOperationResponse = (
  op: Partial<DeployOperationResponse> = {},
): DeployOperationResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    type: "",
    status: "unknown",
    created_at: now,
    updated_at: now,
    git_ref: "",
    docker_ref: "",
    container_count: 0,
    container_size: 0,
    disk_size: 0,
    encrypted_env_json_new: "",
    destination_region: "",
    automated: false,
    cancelled: false,
    aborted: false,
    immediate: false,
    provisioned_iops: 0,
    ebs_volume_type: "",
    encrypted_stack_settings: "",
    instance_profile: "",
    user_name: "",
    user_email: "",
    env: "",
    note: "",
    _links: {
      account: { href: "" },
      code_scan_result: { href: "" },
      ephemeral_sessions: { href: "" },
      logs: { href: "" },
      resource: { href: "" },
      self: { href: "" },
      ssh_portal_connections: { href: "" },
      user: { href: "" },
      ...op._links,
    },
    _type: "operation",
    ...op,
  };
};

const transformOperationType = (
  type: string | undefined | null,
): OperationType => {
  if (!type) return "unknown";
  // TODO: make this more strict?
  return type as OperationType;
};

export const prettyResourceType = (rType: ResourceType): string => {
  if (rType === "vhost") {
    return "Endpoint";
  }
  return capitalize(rType.replace("_", " "));
};

export const deserializeDeployOperation = (
  payload: DeployOperationResponse,
): DeployOperation => {
  return {
    id: `${payload.id}`,
    environmentId: extractIdFromLink(payload._links.account),
    codeScanResultId: extractIdFromLink(payload._links.code_scan_result),
    resourceId: extractIdFromLink(payload._links.resource),
    resourceType: extractResourceNameFromLink(payload._links.resource),
    type: transformOperationType(payload.type),
    status: payload.status,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    gitRef: payload.git_ref || "",
    dockerRef: payload.docker_ref,
    containerCount: payload.container_count,
    containerSize: payload.container_size,
    diskSize: payload.disk_size,
    encryptedEnvJsonNew: payload.encrypted_env_json_new,
    destinationRegion: payload.destination_region,
    cancelled: payload.cancelled,
    aborted: payload.aborted,
    automated: payload.automated,
    immediate: payload.immediate,
    provisionedIops: payload.provisioned_iops,
    ebsVolumeType: payload.ebs_volume_type,
    encryptedStackSettings: payload.encrypted_stack_settings,
    instanceProfile: payload.instance_profile,
    userEmail: payload.user_email,
    userName: payload.user_name,
    env: payload.env,
    note: payload.note,
  };
};

// Search an array of operations for the first that has the specified attribute
// If none are found, use the value from the defaultDeployOperation
export const findOperationValue = <K extends keyof DeployOperation>(
  ops: DeployOperation[],
  attr: K,
) => {
  const op = ops.find((op) => op[attr] != null);
  return op == null ? defaultDeployOperation()[attr] : op[attr];
};

export const hasDeployOperation = (a: DeployOperation) => a.id !== "";
export const selectOperationById = schema.operations.selectById;
export const selectOperationsAsList = createSelector(
  schema.operations.selectTableAsList,
  (_: WebState, props: { limit?: number }) => props.limit,
  (ops, limit) =>
    [...ops]
      .sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .slice(0, limit),
);

export const selectOperationsByResourceId = createSelector(
  selectOperationsAsList,
  (_: WebState, props: { resourceId: string }) => props.resourceId,
  (ops, resourceId) => ops.filter((op) => op.resourceId === resourceId),
);

export const selectLatestProvisionOps = createSelector(
  selectOperationsAsList,
  (_: WebState, props: { resourceIds: string[] }) => props.resourceIds,
  (ops, resourceIds) => {
    const results: DeployOperation[] = [];
    for (let i = 0; i < resourceIds.length; i += 1) {
      const id = resourceIds[i];
      const op = ops.find((o) => o.resourceId === id && o.type === "provision");
      if (op) {
        results.push(op);
      }
    }
    return results;
  },
);

export const selectOperationsByEnvId = createSelector(
  selectOperationsAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  (ops, envId) => ops.filter((op) => op.environmentId === envId),
);

export const findOperationsByServiceId = (
  ops: DeployOperation[],
  serviceId: string,
) =>
  ops.filter(
    (op) => op.resourceType === "service" && op.resourceId === serviceId,
  );

export const findOperationsByAppId = (ops: DeployOperation[], appId: string) =>
  ops.filter((op) => op.resourceType === "app" && op.resourceId === appId);

export const findOperationsByDbId = (ops: DeployOperation[], dbId: string) =>
  ops.filter((op) => op.resourceType === "database" && op.resourceId === dbId);

export const selectOperationsByServiceId = createSelector(
  selectOperationsAsList,
  (_: WebState, p: { id: string }) => p.id,
  findOperationsByServiceId,
);

export const selectOperationsByAppId = createSelector(
  selectOperationsAsList,
  (_: WebState, p: { appId: string }) => p.appId,
  findOperationsByAppId,
);

export const findLatestSuccessProvisionDbOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.resourceType === "database" && op.status === "succeeded");

export const selectOperationsByDatabaseId = createSelector(
  selectOperationsAsList,
  (_: WebState, p: { dbId: string }) => p.dbId,
  findOperationsByDbId,
);

export const selectLatestOpByDatabaseId = createSelector(
  selectOperationsByDatabaseId,
  (ops) => (ops.length > 0 ? ops[0] : schema.operations.empty),
);

export const selectLatestOpByAppId = createSelector(
  selectOperationsByAppId,
  (ops) =>
    ops.find((op) =>
      ["configure", "provision", "deploy", "deprovision"].includes(op.type),
    ) || schema.operations.empty,
);

export const selectLatestOpByResourceId = createSelector(
  selectOperationsAsList,
  (_: WebState, p: { resourceId: string }) => p.resourceId,
  (_: WebState, p: { resourceType: ResourceType }) => p.resourceType,
  (ops, resourceId, resourceType) =>
    ops.find(
      (op) =>
        op.resourceId === resourceId &&
        op.resourceType === resourceType &&
        ["configure", "provision", "deploy", "deprovision"].includes(op.type),
    ) || schema.operations.empty,
);

export const selectLatestProvisionOp = createSelector(
  selectOperationsByResourceId,
  (_: WebState, p: { resourceType: ResourceType }) => p.resourceType,
  (ops, resourceType) =>
    ops.find(
      (op) => op.type === "provision" && op.resourceType === resourceType,
    ) || schema.operations.empty,
);

export const selectNonFailedScaleOps = createSelector(
  selectOperationsByServiceId,
  (ops) => ops.filter((op) => op.type === "scale" && op.status !== "failed"),
);

export const selectPreviousServiceScale = createSelector(
  selectServiceById,
  selectNonFailedScaleOps,
  (service, ops) => {
    // If the values aren't found among the operations use the following default values
    const pastOps = ops.slice(1).concat(
      defaultDeployOperation({
        containerCount: 1,
        containerSize: 1024,
        instanceProfile: service.instanceClass,
      }),
    );

    const prev: DeployOperation = { ...pastOps[0] };

    scaleAttrs.forEach((attr) => {
      (prev as any)[attr] = findOperationValue(pastOps, attr);
    });

    return prev;
  },
);

export const selectServiceScale = createSelector(
  selectNonFailedScaleOps,
  selectPreviousServiceScale,
  (ops, prevOp) => {
    const lastOps = ops.slice(0, 1).concat(prevOp);
    const current: DeployOperation = { ...lastOps[0] };

    scaleAttrs.forEach((attr) => {
      (current as any)[attr] = findOperationValue(lastOps, attr);
    });

    return current;
  },
);

export const selectLatestScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "scan_code") || schema.operations.empty,
);

export const selectLatestConfigureOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "configure") || schema.operations.empty,
);

export const findLatestDeployOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "deploy");

export const findLatestDbProvisionOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.resourceType === "database" && op.type === "provision");

export const selectLatestDeployOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "deploy") || schema.operations.empty,
);

export const selectLatestDeployOpWithCodeScan = createSelector(
  selectOperationsByAppId,
  (ops) =>
    ops.find((op) => op.type === "deploy" && op.codeScanResultId !== "") ||
    schema.operations.empty,
);

export const findLatestSuccessDeployOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "deploy" && op.status === "succeeded");

export const selectLatestSuccessDeployOpByEnvId = createSelector(
  selectOperationsByEnvId,
  (ops) => findLatestSuccessDeployOp(ops) || schema.operations.empty,
);

export const findLatestSuccessScanOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "scan_code" && op.status === "succeeded");

export const selectLatestSuccessScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => findLatestSuccessScanOp(ops) || schema.operations.empty,
);

interface EnvIdProps {
  envId: string;
}

interface EnvOpProps extends PaginateProps, EnvIdProps {}

export const fetchEnvOperations = api.get<EnvOpProps>(
  "/accounts/:envId/operations?page=:page&per_page=250",
  { supervisor: takeLeading },
);

export const fetchAllEnvOps = thunks.create<EnvIdProps>(
  "fetch-all-env-ops",
  { supervisor: cacheShortTimer() },
  combinePages(fetchEnvOperations, { max: 2 }),
);

function* paginateOps(
  ctx: DeployApiCtx<
    any,
    HalEmbedded<{ operations: DeployOperationResponse[] }>
  >,
  next: Next,
) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.operations.map(
    (entity) => `${entity.id}`,
  );
  const paginatedData = { ...ctx.json.value, _embedded: { operations: ids } };
  yield* schema.update(schema.cache.add({ [ctx.key]: paginatedData }));
}

export const cancelOrgOperationsPoll = createAction("cancel-org-ops-poll");
export const pollOrgOperations = api.get<{ orgId: string }>(
  "/organizations/:orgId/operations",
  { supervisor: poll(10 * 1000, `${cancelOrgOperationsPoll}`) },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByOrgId({ page: 1, id: ctx.payload.orgId });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationsByOrgId = api.get<{ id: string } & PaginateProps>(
  "/organizations/:id/operations?page=:page",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const fetchOperationsByEnvId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  "/accounts/:id/operations?page=:page",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const cancelEnvOperationsPoll = createAction("cancel-env-ops-poll");
export const pollEnvOperations = api.get<
  EnvIdProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  ["/accounts/:envId/operations?page=1", "poll"],
  { supervisor: poll(10 * 1000, `${cancelEnvOperationsPoll}`) },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByEnvId({ page: 1, id: ctx.payload.envId });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationsByAppId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  "/apps/:id/operations?page=:page&with_services=true",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const cancelAppOpsPoll = createAction("cancel-app-ops-poll");
export const pollAppOperations = api.get<{ id: string }>(
  ["/apps/:id/operations?with_services=true", "poll"],
  {
    supervisor: poll(10 * 1000, `${cancelAppOpsPoll}`),
  },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByAppId({ page: 1, id: ctx.payload.id });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationsByDatabaseId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  "/databases/:id/operations?page=:page&with_services=true",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const cancelDatabaseOpsPoll = createAction("cancel-db-ops-poll");
export const pollDatabaseOperations = api.get<{ id: string }>(
  ["/databases/:id/operations?with_services=true", "poll"],
  { supervisor: poll(10 * 1000, `${cancelDatabaseOpsPoll}`) },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByDatabaseId({ page: 1, id: ctx.payload.id });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationsByServiceId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  "/services/:id/operations?page=:page",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const cancelServicesOpsPoll = createAction("cancel-services-ops-poll");
export const pollServiceOperations = api.get<{ id: string }>(
  ["/services/:id/operations", "poll"],
  { supervisor: poll(10 * 1000, `${cancelServicesOpsPoll}`) },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByServiceId({ page: 1, id: ctx.payload.id });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationsByEndpointId = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ operations: DeployOperationResponse[] }>
>(
  "/vhosts/:id/operations?page=:page",
  { supervisor: cacheTimer() },
  paginateOps,
);

export const cancelEndpointOpsPoll = createAction("cancel-enp-ops-poll");
export const pollEndpointOperations = api.get<{ id: string }>(
  ["/vhosts/:id/operations", "poll"],
  { supervisor: poll(10 * 1000, `${cancelEndpointOpsPoll}`) },
  function* (ctx, next) {
    yield* next();
    const action = fetchOperationsByEndpointId({ page: 1, id: ctx.payload.id });
    yield* paginateOps({ ...ctx, key: action.payload.key }, function* () {});
  },
);

export const fetchOperationLogs = api.get<{ id: string } & Retryable>(
  "/operations/:id/logs",
  [
    function* (ctx, next) {
      ctx.cache = true;
      ctx.bodyType = "text";

      yield* next();

      if (!ctx.json.ok) {
        return;
      }

      const url = ctx.json.value;
      const response = yield* call(() => fetch(url));
      const message = yield* call(() => response.text());

      if (!response.ok) {
        ctx.json = {
          ok: false,
          error: { message },
        };
        return;
      }
      // overwrite the URL provided by the API with the actual logs
      // so we can just fetch the data in a single endpoint
      ctx.json.value = message;
    },
    mdw.fetchRetry(),
  ],
);

export const fetchOperationById = api.get<
  { id: string },
  DeployOperationResponse
>("/operations/:id");

export const cancelOpByIdPoll = createAction("cancel-op-by-id-poll");
export const pollOperationById = api.get<
  { id: string },
  DeployOperationResponse
>(["/operations/:id", "poll"], {
  supervisor: poll(3 * 1000, `${cancelOpByIdPoll}`),
});

export const scaleService = api.post<
  ServiceScaleProps,
  DeployOperationResponse
>(["/services/:id/operations", "scale"], function* (ctx, next) {
  const { id, containerCount, containerProfile, containerSize } = ctx.payload;
  const body = {
    type: "scale",
    id,
    container_count: containerCount,
    instance_profile: containerProfile,
    container_size: containerSize,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Scale service operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

type WaitResult = DeployOperation | undefined;

export function* waitForOperation({
  id,
  wait = 3 * 1000,
  skipFetch = false,
}: {
  id: string;
  wait?: number;
  skipFetch?: boolean;
}): Operation<WaitResult> {
  while (true) {
    if (skipFetch) {
      const op = yield* select((s: WebState) => selectOperationById(s, { id }));
      if (op.status === "succeeded" || op.status === "failed") {
        return op;
      }
    } else {
      const ctx = yield* call(() =>
        fetchOperationById.run(fetchOperationById({ id })),
      );

      if (ctx.json.ok) {
        if (
          ctx.json.value.status === "succeeded" ||
          ctx.json.value.status === "failed"
        ) {
          return deserializeDeployOperation(ctx.json.value);
        }
      } else {
        const op = yield* select((s: WebState) =>
          selectOperationById(s, { id }),
        );
        // When a deprovision happens and it is successful, the API will
        // eventually return a 404 because the operation is "soft" deleted.
        // As a result, we "hack" the FE by checking for this edge case
        // and then marking the operation as successful.
        // This is okay because after the user refreshes the page, the
        // operation will disappear.
        if (op.type === "deprovision" && ctx.response?.status === 404) {
          yield* schema.update(
            schema.operations.patch({
              [op.id]: { id: op.id, status: "succeeded" },
            }),
          );
          return { ...op, status: "succeeded" };
        }
      }
    }

    yield* delay(wait);
  }
}

export const opEntities = {
  operation: defaultEntity({
    id: "operation",
    deserialize: deserializeDeployOperation,
    save: schema.operations.add,
  }),
};

export const createReadableStatus = (status: OperationStatus): string => {
  switch (status) {
    case "queued":
      return "QUEUED";
    case "running":
      return "PENDING";
    case "succeeded":
      return "DONE";
    case "failed":
      return "FAILED";
    default:
      return status.toLocaleUpperCase();
  }
};

export const getResourceUrl = ({
  resourceId,
  resourceType,
  url,
}: Pick<DeployActivityRow, "resourceId" | "resourceType" | "url">) => {
  switch (resourceType) {
    case "app":
      return appDetailUrl(resourceId);
    case "database":
      return databaseDetailUrl(resourceId);
    case "vhost":
      return endpointDetailUrl(resourceId);
    case "metric_drain":
    case "log_drain":
    case "service":
      return url;
    default:
      return "";
  }
};
