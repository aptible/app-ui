import type {
  DeployBackup,
  DeployCostRates,
  DeployDisk,
  DeployService,
  InstanceClass,
} from "@app/types";

export const hoursPerMonth = 730;

export const profileCostPerGBHour = (
  rates: DeployCostRates,
  instanceClass: InstanceClass,
) => {
  let profileRate = rates.m_class_gb_per_hour;
  if (instanceClass.startsWith("r")) {
    profileRate = rates.r_class_gb_per_hour;
  } else if (instanceClass.startsWith("c")) {
    profileRate = rates.c_class_gb_per_hour;
  }
  return profileRate;
};

export type ServiceCostProps = Pick<
  DeployService,
  "containerCount" | "containerMemoryLimitMb" | "instanceClass"
>;
export type DiskCostProps = Pick<DeployDisk, "size" | "provisionedIops">;
export type EndpointCostProps = any;
export type BackupCostProps = Pick<DeployBackup, "size">;

export type EstimateMonthlyCostProps = {
  rates: DeployCostRates;
  services?: ServiceCostProps[];
  disks?: DiskCostProps[];
  endpoints?: EndpointCostProps[];
  backups?: BackupCostProps[];
};

export const estimateMonthlyCost = ({
  rates,
  services = [],
  disks = [],
  endpoints = [],
  backups = [],
}: EstimateMonthlyCostProps) => {
  let hourlyCost = 0.0;

  for (const service of services) {
    const profileRate = profileCostPerGBHour(rates, service.instanceClass);

    hourlyCost +=
      ((service.containerCount * service.containerMemoryLimitMb) / 1024) *
      profileRate;
  }

  hourlyCost += endpoints.length * rates.vhost_cost_per_hour;

  let monthlyCost = hourlyCost * hoursPerMonth;

  for (const disk of disks) {
    monthlyCost += disk.size * rates.disk_cost_gb_per_month;
    monthlyCost +=
      Math.max(disk.provisionedIops - 3000, 0) * rates.disk_iops_cost_per_month;
  }

  for (const backup of backups) {
    monthlyCost += backup.size * rates.backup_cost_gb_per_month;
  }

  return monthlyCost;
};
