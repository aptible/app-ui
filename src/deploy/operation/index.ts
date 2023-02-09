import { api } from "@app/api";
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
} from "@app/types";
import { createAction, createSelector } from "@reduxjs/toolkit";
import { poll } from "saga-query";
import { selectDeploy } from "../slice";

export interface DeployOperationResponse {
  id: string;
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
    resourceType: "",
    type: "",
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

export const deserializeDeployOperation = (
  payload: DeployOperationResponse,
): DeployOperation => {
  return {
    id: payload.id,
    environmentId: extractIdFromLink(payload._links.account),
    codeScanResultId: extractIdFromLink(payload._links.code_scan_result),
    resourceId: extractIdFromLink(payload._links.resource),
    resourceType: extractResourceNameFromLink(payload._links.resource),
    type: payload.type,
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

export const selectOperationsByEnvId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (ops, envId) => ops.filter((op) => op.environmentId === envId),
);

export const selectOperationsByAppId = createSelector(
  selectOperationsAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  (ops, appId) =>
    ops.filter((op) => op.resourceType === "apps" && op.resourceId === appId),
);

export const selectLatestScanOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "scan_code") || initOp,
);

export const selectLatestSucceessScanOp = createSelector(
  selectOperationsByAppId,
  (ops) =>
    ops.find((op) => op.type === "scan_code" && op.status === "succeeded") ||
    initOp,
);

export const selectLatestDeployOp = createSelector(
  selectOperationsByAppId,
  (ops) => ops.find((op) => op.type === "deploy") || initOp,
);

export const cancelEnvOperationsPoll = createAction("cancel-env-ops-poll");

export const pollEnvOperations = api.get<{ envId: string }>(
  "/accounts/:envId/operations",
  { saga: poll(5 * 1000, `${cancelEnvOperationsPoll}`) },
);

export const opEntities = {
  operation: defaultEntity({
    id: "operation",
    deserialize: deserializeDeployOperation,
    save: addDeployOperations,
  }),
};
