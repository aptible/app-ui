import type { DeployOperation } from "@app/types";

export const deserializeOperation = (payload: any): DeployOperation | null => {
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
