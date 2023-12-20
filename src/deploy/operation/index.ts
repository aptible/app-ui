import { call, delay, leading, mdw, poll, put, select } from "@app/fx";
import { createAction, createSelector } from "@reduxjs/toolkit";

import {
  PaginateProps,
  Retryable,
  api,
  cacheShortTimer,
  combinePages,
  thunks,
} from "@app/api";
import { Operation } from "@app/fx";
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
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { capitalize } from "@app/string-utils";
import type {
  AppState,
  DeployActivityRow,
  DeployOperation,
  LinkResponse,
  OperationStatus,
  OperationType,
  ResourceType,
} from "@app/types";
import { selectDeploy } from "../slice";

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

export const defaultDeployOperation = (
  op: Partial<DeployOperation> = {},
): DeployOperation => {
  const now = new Date().toISOString();
  return {
    id: "",
    environmentId: "",
    codeScanResultId: "",
    resourceId: "",
    resourceType: "unknown",
    type: "unknown",
    status: "unknown",
    createdAt: now,
    updatedAt: now,
    gitRef: "",
    dockerRef: "",
    containerCount: 0,
    containerSize: 0,
    diskSize: 0,
    encryptedEnvJsonNew: "",
    destinationRegion: "",
    cancelled: false,
    aborted: false,
    automated: false,
    immediate: false,
    provisionedIops: 0,
    ebsVolumeType: "",
    encryptedStackSettings: "",
    instanceProfile: "",
    userName: "unknown",
    userEmail: "",
    env: "",
    note: "",
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

export const DEPLOY_OP_NAME = "operations";
const slice = createTable<DeployOperation>({ name: DEPLOY_OP_NAME });
export const { add: addDeployOperations, patch: patchDeployOperations } =
  slice.actions;
export const hasDeployOperation = (a: DeployOperation) => a.id !== "";
export const opReducers = createReducerMap(slice);

const initOp = defaultDeployOperation();
const must = mustSelectEntity(initOp);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_OP_NAME],
);
export const selectOperationById = must(selectors.selectById);
const { selectTableAsList } = selectors;
export const selectOperationsAsList = createSelector(
  selectTableAsList,
  (_: AppState, props: { limit?: number }) => props.limit,
  (ops, limit) =>
    ops
      .sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .slice(0, limit),
);

export const selectOperationsByResourceId = createSelector(
  selectOperationsAsList,
  (_: AppState, props: { resourceId: string }) => props.resourceId,
  (ops, resourceId) => ops.filter((op) => op.resourceId === resourceId),
);

export const selectLatestProvisionOps = createSelector(
  selectOperationsAsList,
  (_: AppState, props: { resourceIds: string[] }) => props.resourceIds,
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
  (_: AppState, p: { envId: string }) => p.envId,
  (ops, envId) => ops.filter((op) => op.environmentId === envId),
);

export const findOperationsByAppId = (ops: DeployOperation[], appId: string) =>
  ops.filter((op) => op.resourceType === "app" && op.resourceId === appId);

export const findOperationsByDbId = (ops: DeployOperation[], dbId: string) =>
  ops.filter((op) => op.resourceType === "database" && op.resourceId === dbId);

export const selectOperationsByAppId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  findOperationsByAppId,
);

export const findLatestSuccessProvisionDbOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.resourceType === "database" && op.status === "succeeded");

export const selectOperationsByDatabaseId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  findOperationsByDbId,
);

export const selectLatestOpByDatabaseId = createSelector(
  selectOperationsByDatabaseId,
  (ops) => (ops.length > 0 ? ops[0] : initOp),
);

export const selectLatestOpByAppId = createSelector(
  selectOperationsByAppId,
  (ops) =>
    ops.find((op) =>
      ["configure", "provision", "deploy", "deprovision"].includes(op.type),
    ) || initOp,
);

export const selectLatestOpByResourceId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { resourceId: string }) => p.resourceId,
  (_: AppState, p: { resourceType: ResourceType }) => p.resourceType,
  (ops, resourceId, resourceType) =>
    ops.find(
      (op) =>
        op.resourceId === resourceId &&
        op.resourceType === resourceType &&
        ["configure", "provision", "deploy", "deprovision"].includes(op.type),
    ) || initOp,
);

export const selectLatestProvisionOp = createSelector(
  selectOperationsByResourceId,
  (_: AppState, p: { resourceType: ResourceType }) => p.resourceType,
  (ops, resourceType) =>
    ops.find(
      (op) => op.type === "provision" && op.resourceType === resourceType,
    ) || initOp,
);

export const selectLatestScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "scan_code") || initOp,
);

export const selectLatestConfigureOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "configure") || initOp,
);

export const findLatestDeployOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "deploy");

export const findLatestDbProvisionOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.resourceType === "database" && op.type === "provision");

export const selectLatestDeployOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "deploy") || initOp,
);

export const findLatestSuccessDeployOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "deploy" && op.status === "succeeded");

export const selectLatestSuccessDeployOpByEnvId = createSelector(
  selectOperationsByEnvId,
  (ops) => findLatestSuccessDeployOp(ops) || initOp,
);

export const findLatestSuccessScanOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.type === "scan_code" && op.status === "succeeded");

export const selectLatestSucceessScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => findLatestSuccessScanOp(ops) || initOp,
);

interface EnvIdProps {
  envId: string;
}

interface EnvOpProps extends PaginateProps, EnvIdProps {}

export const fetchEnvOperations = api.get<EnvOpProps>(
  "/accounts/:envId/operations?page=:page&per_page=250",
  { supervisor: leading },
);

export const fetchAllEnvOps = thunks.create<EnvIdProps>(
  "fetch-all-env-ops",
  { supervisor: cacheShortTimer() },
  combinePages(fetchEnvOperations, { max: 2 }),
);

export const cancelEnvOperationsPoll = createAction("cancel-env-ops-poll");
export const pollEnvOperations = api.get<EnvIdProps>(
  ["/accounts/:envId/operations", "poll"],
  { supervisor: poll(10 * 1000, `${cancelEnvOperationsPoll}`) },
);

export const fetchOrgOperations = api.get<{ orgId: string }>(
  "/organizations/:orgId/operations?per_page=250",
  { supervisor: leading },
);

export const cancelOrgOperationsPoll = createAction("cancel-org-ops-poll");
export const pollOrgOperations = api.get<{ orgId: string }>(
  "/organizations/:orgId/operations",
  { supervisor: poll(10 * 1000, `${cancelOrgOperationsPoll}`) },
);

export const fetchOperationLogs = api.get<{ id: string } & Retryable, string>(
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
      const data = yield* call(() => response.text());

      if (!response.ok) {
        ctx.json = {
          ok: false,
          data,
          error: data,
        };
        return;
      }
      // overwrite the URL provided by the API with the actual logs
      // so we can just fetch the data in a single endpoint
      ctx.json.value = data;
      ctx.json.data = data;
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
      const op = yield* select((s: AppState) => selectOperationById(s, { id }));
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
        const op = yield* select((s: AppState) =>
          selectOperationById(s, { id }),
        );
        // When a deprovision happens and it is successful, the API will
        // eventually return a 404 because the operation is "soft" deleted.
        // As a result, we "hack" the FE by checking for this edge case
        // and then marking the operation as successful.
        // This is okay because after the user refreshes the page, the
        // operation will disappear.
        if (op.type === "deprovision" && ctx.response?.status === 404) {
          yield* put(
            patchDeployOperations({
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
    save: addDeployOperations,
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
