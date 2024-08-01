import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { DeployDisk, DeployDiskResponse } from "@app/types";

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
    _links: {
      database: defaultHalHref(),
      account: defaultHalHref(),
      ...d._links,
    },
  };
};

export const deserializeDisk = (payload: DeployDiskResponse): DeployDisk => {
  const links = payload._links;
  const environmentId = extractIdFromLink(links.account);
  const databaseId = extractIdFromLink(links.database);

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
    environmentId: environmentId,
    databaseId: databaseId,
  };
};

export const fetchDiskById = api.get<{ id: string }>("/disks/:id");

export const selectDiskById = schema.disks.selectById;
export const selectDisks = schema.disks.selectTable;
export const selectDisksAsList = schema.disks.selectTableAsList;
export const findDiskById = schema.disks.findById;

export const diskEntities = {
  disk: defaultEntity({
    id: "disk",
    save: schema.disks.add,
    deserialize: deserializeDisk,
  }),
};

export const findDisksByEnvId = (disks: DeployDisk[], envId: string) =>
  disks.filter((d) => d.environmentId === envId);

export const selectDisksByEnvId = createSelector(
  selectDisksAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  findDisksByEnvId,
);
