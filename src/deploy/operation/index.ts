import { api } from "@app/api";
import type { DeployOperation, OperationStatus } from "@app/types";
import { createAction } from "@reduxjs/toolkit";
import { poll } from "saga-query";

export interface DeployOperationResponse {
  id: string;
  resource_id: number;
  resource_type: string;
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
}

export const deserializeOperation = (
  payload: DeployOperationResponse,
): DeployOperation | null => {
  if (!payload) {
    return null;
  }
  return {
    id: payload.id,
    resourceId: payload.resource_id,
    resourceType: payload.resource_type,
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

export const cancelEnvOperationsPoll = createAction("cancel-env-ops-poll");

export const pollEnvOperations = api.get<{ envId: string }>(
  "/accounts/:envId/operations",
  { saga: poll(5 * 1000, `${cancelEnvOperationsPoll}`) },
  api.cache(),
);
