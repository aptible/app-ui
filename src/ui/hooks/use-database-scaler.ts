import { estimateMonthlyCost, getContainerProfileFromType } from "@app/deploy";
import type { DeployDisk, DeployService, InstanceClass } from "@app/types";
import { useEffect, useReducer } from "react";

export interface DbScaleOptions {
  diskSize: number;
  containerSize: number;
  containerProfile: InstanceClass;
  iops: number;
}

export type DbScaleAction =
  | { type: "diskSize"; payload: number }
  | { type: "containerSize"; payload: number }
  | { type: "containerProfile"; payload: InstanceClass }
  | { type: "iops"; payload: number }
  | { type: "set"; payload: DbScaleOptions };

function dbScaleReducer(
  state: DbScaleOptions,
  action: DbScaleAction,
): DbScaleOptions {
  switch (action.type) {
    case "set":
      return action.payload;
    case "diskSize":
      return { ...state, diskSize: action.payload };
    case "iops":
      return { ...state, iops: action.payload };
    case "containerSize":
      return { ...state, containerSize: action.payload };
    case "containerProfile": {
      const profile = getContainerProfileFromType(action.payload);
      const containerSize = Math.max(
        state.containerSize,
        profile.minimumContainerSize,
      );
      return { ...state, containerProfile: action.payload, containerSize };
    }
    default:
      return state;
  }
}

export function defaultDatabaseScaler(
  service: DeployService,
  disk: DeployDisk,
): DbScaleOptions {
  return {
    diskSize: disk.size,
    iops: disk.provisionedIops,
    containerSize: service.containerMemoryLimitMb,
    containerProfile: service.instanceClass,
  };
}

export function useDatabaseScaler({
  service,
  disk,
}: { service: DeployService; disk: DeployDisk }) {
  const opts = defaultDatabaseScaler(service, disk);
  const [scaler, dispatchScaler] = useReducer(dbScaleReducer, opts);

  // if source of truth has changed, update `scaler` obj
  useEffect(() => {
    dispatchScaler({ type: "set", payload: opts });
  }, [
    disk.size,
    disk.provisionedIops,
    service.containerMemoryLimitMb,
    service.instanceClass,
  ]);

  const changesExist =
    service.containerMemoryLimitMb !== scaler.containerSize ||
    service.instanceClass !== scaler.containerProfile ||
    disk.size !== scaler.diskSize ||
    disk.provisionedIops !== scaler.iops;

  const currentContainerProfile = getContainerProfileFromType(
    service.instanceClass,
  );
  const requestedContainerProfile = getContainerProfileFromType(
    scaler.containerProfile,
  );
  const currentPrice = estimateMonthlyCost({
    services: [service],
    disks: [disk],
  });
  const estimatedPrice = estimateMonthlyCost({
    services: [
      {
        containerCount: 1,
        containerMemoryLimitMb: scaler.containerSize,
        instanceClass: scaler.containerProfile,
      },
    ],
    disks: [{ size: scaler.diskSize, provisionedIops: scaler.iops }],
  });

  return {
    scaler,
    dispatchScaler,
    changesExist,
    currentPricePerGBHour:
      currentContainerProfile.costPerContainerGBHourInCents / 100,
    currentPrice,
    requestedPricePerGBHour:
      requestedContainerProfile.costPerContainerGBHourInCents / 100,
    estimatedPrice,
    requestedContainerProfile,
    currentContainerProfile,
  };
}
