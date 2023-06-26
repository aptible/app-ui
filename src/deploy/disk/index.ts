import type { DeployDisk } from "@app/types";

export const deserializeDisk = (payload: any): DeployDisk => {
  return {
    attached: payload.attached,
    availabilityZone: payload.availability_zone,
    baselineIops: payload.baseline_iops,
    provisionedIops: payload.provisioned_iops,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    currentKmsArn: payload.current_kms_arn,
    device: payload.device,
    ebsVolumeId: payload.ebs_volume_id,
    ebsVolumeType: payload.ebs_volume_type,
    ec2InstanceId: payload.instance_id,
    filesystem: payload.filesystem,
    handle: payload.handle,
    host: payload.host,
    id: payload.id,
    size: payload.size,
    keyBytes: payload.key_bytes,
  };
};

export const defaultDeployDisk = (d: Partial<DeployDisk> = {}): DeployDisk => {
  const now = new Date().toISOString();
  return {
    id: "",
    attached: true,
    availabilityZone: "",
    baselineIops: 0,
    provisionedIops: 0,
    createdAt: now,
    updatedAt: now,
    currentKmsArn: "",
    device: "",
    ebsVolumeId: "",
    ebsVolumeType: "",
    ec2InstanceId: "",
    filesystem: "",
    handle: "",
    host: "",
    size: 0,
    keyBytes: 0,
    ...d,
  };
};
