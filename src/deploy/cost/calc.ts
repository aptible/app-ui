import { type WebState, schema } from "@app/schema";
import type {
  DeployBackup,
  DeployCostRates,
  DeployDisk,
  DeployEndpoint,
  DeployService,
  InstanceClass,
} from "@app/types";
import { createSelector } from "starfx";

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

export const estimateMonthlyCost = createSelector(
  schema.costRates.select,
  (_: WebState, { services = [] }: { services?: DeployService[] }) => services,
  (_: WebState, { disks = [] }: { disks?: DeployDisk[] }) => disks,
  (_: WebState, { endpoints = [] }: { endpoints?: DeployEndpoint[] }) =>
    endpoints,
  (_: WebState, { backups = [] }: { backups?: DeployBackup[] }) => backups,
  (rates, services, disks, endpoints, backups) => {
    let hourlyCost = 0.0;

    for (const service of services) {
      const profileRate = profileCostPerGBHour(rates, service.instanceClass);

      hourlyCost +=
        ((service.containerCount * service.containerMemoryLimitMb) / 1024) *
        profileRate;
    }

    hourlyCost += endpoints.length * rates.vhost_cost_per_hour;

    // Monthly cost
    let monthlyCost = hourlyCost * hoursPerMonth;

    for (const disk of disks) {
      monthlyCost += disk.size * rates.disk_cost_gb_per_month;
      monthlyCost +=
        Math.max(disk.provisionedIops - 3000, 0) *
        rates.disk_iops_cost_per_month;
    }

    for (const backup of backups) {
      monthlyCost += backup.size * rates.backup_cost_gb_per_month;
    }

    return monthlyCost;
  },
);
