import { CONTAINER_PROFILES } from "@app/deploy";
import { DEFAULT_INSTANCE_CLASS } from "@app/schema";
import type { DeployBackup, DeployDisk, DeployService } from "@app/types";

export const hoursPerMonth = 731;

export const diskCostPerGBMonth = 0.2;
export const diskIopsCostPerMonth = 0.01;
export const endpointCostPerHour = 0.05;
export const backupCostPerGBHour = 0.02;
export const vpnTunnelCostPerMonth = 99;
export const stackCostPerMonth = 499;

export type CalculateCostProps = {
  services?: Pick<
    DeployService,
    "containerCount" | "containerMemoryLimitMb" | "instanceClass"
  >[];
  disks?: Pick<DeployDisk, "size" | "provisionedIops">[];
  endpoints?: any[];
  backups?: Pick<DeployBackup, "size">[];
  vpn_tunnels?: any[];
  stacks?: any[];
};
export const calculateCost = ({
  services = [],
  disks = [],
  endpoints = [],
  backups = [],
  vpn_tunnels = [],
  stacks = [],
}: CalculateCostProps) => {
  // Returns the hourly cost of resources billed by the hour and monthly cost of all resources
  // Hourly cost
  let hourlyCost = 0;

  for (const service of services) {
    hourlyCost +=
      (((service.containerCount * service.containerMemoryLimitMb) / 1024) *
        CONTAINER_PROFILES[service.instanceClass || DEFAULT_INSTANCE_CLASS]
          .costPerContainerGBHourInCents) /
      100;
  }

  hourlyCost += endpoints.length * endpointCostPerHour;

  for (const backup of backups) {
    hourlyCost += backup.size * backupCostPerGBHour;
  }

  // Monthly cost
  let monthlyCost = hourlyCost * hoursPerMonth;

  for (const disk of disks) {
    monthlyCost += disk.size * diskCostPerGBMonth;
    monthlyCost +=
      Math.max(disk.provisionedIops - 3000, 0) * diskIopsCostPerMonth;
  }

  monthlyCost += vpn_tunnels.length * vpnTunnelCostPerMonth;
  monthlyCost += stacks.length * stackCostPerMonth;

  return {
    hourlyCost,
    monthlyCost,
  };
};
