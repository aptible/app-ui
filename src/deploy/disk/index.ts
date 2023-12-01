import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { db } from "@app/schema";
import type { DeployDisk } from "@app/types";

interface DeployDiskResponse {
  attached: boolean;
  availability_zone: string;
  baseline_iops: number;
  provisioned_iops: number;
  created_at: string;
  updated_at: string;
  current_kms_arn: string;
  device: string;
  ebs_volume_id: string;
  ebs_volume_type: string;
  instance_id: string;
  filesystem: string;
  handle: string;
  host: string;
  id: string;
  size: number;
  key_bytes: number;
  _type: "disk";
}

export const defaultDeployDiskResponse = (
  d: Partial<DeployDiskResponse> = {},
): DeployDiskResponse => {
  const now = new Date().toISOString();
  return {
    attached: true,
    availability_zone: "",
    baseline_iops: 0,
    provisioned_iops: 0,
    created_at: now,
    updated_at: now,
    current_kms_arn: "",
    device: "",
    ebs_volume_id: "",
    ebs_volume_type: "",
    instance_id: "",
    filesystem: "",
    handle: "",
    host: "",
    id: "",
    size: 0,
    key_bytes: 32,
    _type: "disk",
    ...d,
  };
};

export const deserializeDisk = (payload: DeployDiskResponse): DeployDisk => {
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

export const fetchDiskById = api.get<{ id: string }>("/disks/:id");

export const selectDiskById = db.disks.selectById;

export const diskEntities = {
  disk: defaultEntity({
    id: "disk",
    save: db.disks.add,
    deserialize: deserializeDisk,
  }),
};
