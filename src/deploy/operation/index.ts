import {
  api,
  combinePages,
  PaginateProps,
  thunks,
  retryable,
  Retryable,
} from "@app/api";
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
import { createAction, createSelector } from "@reduxjs/toolkit";
import { call, poll } from "saga-query";
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
    userName: "",
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
    gitRef: payload.git_ref,
    dockerRef: payload.docker_ref,
    containerCount: payload.container_count,
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
export const selectOperationsAsList = createSelector(selectTableAsList, (ops) =>
  ops.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }),
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

export const selectOperationsByDatabaseId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  (ops, dbId) =>
    ops.filter(
      (op) => op.resourceType === "database" && op.resourceId === dbId,
    ),
);

export const selectLatestProvisionOp = createSelector(
  selectOperationsByResourceId,
  (ops) => ops.find((op) => op.type === "provision") || initOp,
);

export const selectLatestProvisionOps = createSelector(
  selectOperationsByResourceIds,
  (ops) => ops.filter((op) => op.type === "provision") || [],
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

export const selectLatestSucceessScanOp = createSelector(
  selectOperationsByAppId,
  (ops) =>
    ops.find((op) => op.type === "scan_code" && op.status === "succeeded") ||
    initOp,
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
    retryable(),
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
  ],
);

export const opEntities = {
  operation: defaultEntity({
    id: "operation",
    deserialize: deserializeDeployOperation,
    save: addDeployOperations,
  }),
};
