import type { ContainerProfileData, InstanceClass } from "@app/types";

export const GB = 1024;
export const CONTAINER_PROFILES: {
  [profile in InstanceClass]: ContainerProfileData;
} = {
  m4: {
    name: "General Purpose (M) - Legacy",
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 240 * GB,
    maximumContainerCount: 32,
  },
  m5: {
    name: "General Purpose (M)",
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 368 * GB,
    maximumContainerCount: 32,
  },
  m: {
    name: "General Purpose (M)",
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 368 * GB,
    maximumContainerCount: 32,
  },
  r4: {
    name: "Memory Optimized (R) - Legacy",
    cpuShare: 0.125 / GB,
    minimumContainerSize: 4 * GB,
    maximumContainerSize: 472 * GB,
    maximumContainerCount: 32,
  },
  r5: {
    name: "Memory Optimized (R)",
    cpuShare: 0.125 / GB,
    minimumContainerSize: 4 * GB,
    maximumContainerSize: 752 * GB,
    maximumContainerCount: 32,
  },
  r: {
    name: "Memory Optimized (R)",
    cpuShare: 0.125 / GB,
    minimumContainerSize: 4 * GB,
    maximumContainerSize: 752 * GB,
    maximumContainerCount: 32,
  },
  c4: {
    name: "Compute Optimized (C) - Legacy",
    cpuShare: 0.5 / GB,
    minimumContainerSize: 2 * GB,
    maximumContainerSize: 58 * GB,
    maximumContainerCount: 32,
  },
  c5: {
    name: "Compute Optimized (C)",
    cpuShare: 0.5 / GB,
    minimumContainerSize: 2 * GB,
    maximumContainerSize: 368 * GB,
    maximumContainerCount: 32,
  },
  c: {
    name: "Compute Optimized (C)",
    cpuShare: 0.5 / GB,
    minimumContainerSize: 2 * GB,
    maximumContainerSize: 368 * GB,
    maximumContainerCount: 32,
  },
};
