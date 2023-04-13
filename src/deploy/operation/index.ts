import { createAction, createSelector } from "@reduxjs/toolkit";
import { call, delay, fetchRetry, poll } from "saga-query";

import { selectDeploy } from "../slice";
import { PaginateProps, Retryable, api, combinePages, thunks } from "@app/api";
import {
  defaultEntity,
  extractIdFromLink,
  extractResourceNameFromLink,
} from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AppState,
  DeployOperation,
  LinkResponse,
  OperationStatus,
  OperationType,
} from "@app/types";

export interface DeployOperationResponse {
  id: number;
  type: string;
  status: OperationStatus;
  created_at: string;
  updated_at: string;
  git_ref: string;
  docker_ref: string;
  container_count: number;
  encrypted_env_json_new: string;
  destination_region: string;
  automated: boolean;
  cancelled: boolean;
  aborted: boolean;
  immediate: boolean;
  provisioned_iops: number;
  disk_size: number;
  container_size: number;
  ebs_volume_type: string;
  encrypted_stack_settings: string;
  instance_profile: string;
  user_email: string;
  user_name: string;
  env: string;
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
}

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
    status: "queued",
    createdAt: now,
    updatedAt: now,
    gitRef: "",
    dockerRef: "",
    containerCount: 0,
    diskSize: 0,
    containerSize: 0,
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
    diskSize: payload.disk_size,
    containerSize: payload.container_size,
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
  };
};

export const DEPLOY_OP_NAME = "operations";
const slice = createTable<DeployOperation>({ name: DEPLOY_OP_NAME });
const { add: addDeployOperations } = slice.actions;
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
  (_: AppState, props: { limit?: number }) => props,
  (ops, { limit }) =>
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

export const selectOperationsByResourceIds = createSelector(
  selectOperationsAsList,
  (_: AppState, props: { resourceIds: string[] }) => props.resourceIds,
  (ops, resourceIds) => ops.filter((op) => resourceIds.includes(op.resourceId)),
);

export const selectOperationsByEnvId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (ops, envId) => ops.filter((op) => op.environmentId === envId),
);

export const selectOperationsByAppId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  (ops, appId) =>
    ops.filter((op) => op.resourceType === "app" && op.resourceId === appId),
);

export const findLatestSuccessProvisionDbOp = (ops: DeployOperation[]) =>
  ops.find((op) => op.resourceType === "database" && op.status === "succeeded");

export const selectOperationsByDatabaseId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  (ops, dbId) =>
    ops.filter(
      (op) => op.resourceType === "database" && op.resourceId === dbId,
    ),
);

export const selectLatestOpByEnvId = createSelector(
  selectOperationsByEnvId,
  (ops) =>
    ops.find((op) => ["configure", "provision", "deploy"].includes(op.type)) ||
    initOp,
);

export const selectLatestProvisionOp = createSelector(
  selectOperationsByResourceId,
  (ops) => ops.find((op) => op.type === "provision") || initOp,
);

const initLatestProvOps: DeployOperation[] = [];
export const selectLatestProvisionOps = createSelector(
  selectOperationsByResourceIds,
  (ops) => ops.filter((op) => op.type === "provision") || initLatestProvOps,
);

export const selectLatestScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "scan_code") || initOp,
);

export const selectLatestConfigureOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "configure") || initOp,
);

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

export const cancelEnvOperationsPoll = createAction("cancel-env-ops-poll");

interface EnvIdProps {
  envId: string;
}

interface EnvOpProps extends PaginateProps, EnvIdProps {}

export const fetchEnvOperations = api.get<EnvOpProps>(
  "/accounts/:envId/operations?page=:page",
);

export const pollEnvOperations = thunks.create<EnvIdProps>(
  "poll-env-operations",
  { saga: poll(5 * 1000, `${cancelEnvOperationsPoll}`) },
  combinePages(fetchEnvOperations),
);

export const fetchOperationLogs = api.get<{ id: string } & Retryable, string>(
  "/operations/:id/logs",
  [
    function* (ctx, next) {
      ctx.cache = true;
      ctx.bodyType = "text";

      yield next();

      if (!ctx.json.ok) {
        return;
      }

      const url = ctx.json.data;
      const response = yield* call(fetch, url);
      const data = yield* call([response, "text"]);

      if (!response.ok) {
        ctx.json = {
          ok: false,
          data,
        };
        return;
      }
      // overwrite the URL provided by the API with the actual logs
      // so we can just fetch the data in a single endpoint
      ctx.json.data = data;
    },
    fetchRetry(),
  ],
);

export const fetchOperationById = api.get<
  { id: string },
  DeployOperationResponse
>("/operations/:id");

export function* waitForOperation({
  id,
  wait = 3 * 1000,
}: {
  id: string;
  wait?: number;
}) {
  while (true) {
    const ctx = yield* call(fetchOperationById.run, fetchOperationById({ id }));

    if (ctx.json.ok) {
      if (
        ctx.json.data.status === "succeeded" ||
        ctx.json.data.status === "failed"
      ) {
        return ctx.json.data;
      }
    }

    console.log("WAITING");
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
