import { DEFAULT_INSTANCE_CLASS } from "@app/schema";
import type {
  DeployBackup,
  DeployDisk,
  DeployService,
  DeployStack,
  InstanceClass,
} from "@app/types";
import { CONTAINER_PROFILES } from "./container";

export const hoursPerMonth = 731;

export const diskCostPerGBMonth = 0.2;
export const diskIopsCostPerMonth = 0.01;
export const endpointCostPerHour = 0.05;
export const backupCostPerGBMonth = 0.02;
export const vpnTunnelCostPerMonth = 99;
export const stackCostPerMonth = 499;

export type ServiceCostProps = Pick<
  DeployService,
  "containerCount" | "containerMemoryLimitMb" | "instanceClass"
>;
export type DiskCostProps = Pick<DeployDisk, "size" | "provisionedIops">;
export type EndpointCostProps = any;
export type BackupCostProps = Pick<DeployBackup, "size">;
export type VpnTunnelCostProps = any;
export type StackCostProps = Pick<DeployStack, "organizationId">;

export type EstimateMonthlyCostProps = {
  services?: ServiceCostProps[];
  disks?: DiskCostProps[];
  endpoints?: EndpointCostProps[];
  backups?: BackupCostProps[];
  vpnTunnels?: VpnTunnelCostProps[];
  stacks?: StackCostProps[];
};

export const containerProfileCostPerGBHour = (
  profile: InstanceClass | undefined | null,
) =>
  CONTAINER_PROFILES[profile || DEFAULT_INSTANCE_CLASS]
    .costPerContainerGBHourInCents / 100;

export const estimateMonthlyCost = ({
  services = [],
  disks = [],
  endpoints = [],
  backups = [],
  vpnTunnels: vpn_tunnels = [],
  stacks = [],
}: EstimateMonthlyCostProps) => {
  // Returns the monthly cost of all resources
  // Hourly cost
  let hourlyCost = 0;

  for (const service of services) {
    hourlyCost +=
      ((service.containerCount * service.containerMemoryLimitMb) / 1024) *
      containerProfileCostPerGBHour(service.instanceClass);
  }

  hourlyCost += endpoints.length * endpointCostPerHour;

  // Monthly cost
  let monthlyCost = hourlyCost * hoursPerMonth;

  for (const disk of disks) {
    monthlyCost += disk.size * diskCostPerGBMonth;
    monthlyCost +=
      Math.max(disk.provisionedIops - 3000, 0) * diskIopsCostPerMonth;
  }

  for (const backup of backups) {
    monthlyCost += backup.size * backupCostPerGBMonth;
  }

  monthlyCost += vpn_tunnels.length * vpnTunnelCostPerMonth;
  monthlyCost +=
    stacks.filter((stack) => stack.organizationId !== "").length *
    stackCostPerMonth;

  return monthlyCost;
};

export const formatCurrency = (num: number) =>
  num.toLocaleString("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
