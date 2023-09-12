import { ContainerProfileData, InstanceClass } from "@app/types";

export const GB = 1024;
export const CONTAINER_PROFILES: {
  [profile in InstanceClass]: ContainerProfileData;
} = {
  t3: {
    name: "Economy (T)",
    costPerContainerHourInCents: 3.5,
    cpuShare: 0.5 / GB,
    minimumContainerSize: GB / 4,
    maximumContainerSize: 27 * GB,
    maximumContainerCount: 32,
  },
  m4: {
    name: "General Purpose (M) - Legacy",
    costPerContainerHourInCents: 8,
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 240 * GB,
    maximumContainerCount: 32,
  },
  m5: {
    name: "General Purpose (M)",
    costPerContainerHourInCents: 8,
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 368 * GB,
    maximumContainerCount: 32,
  },
  r4: {
    name: "Memory Optimized (R) - Legacy",
    costPerContainerHourInCents: 5,
    cpuShare: 0.125 / GB,
    minimumContainerSize: 4 * GB,
    maximumContainerSize: 472 * GB,
    maximumContainerCount: 32,
  },
  r5: {
    name: "Memory Optimized (R)",
    costPerContainerHourInCents: 5,
    cpuShare: 0.125 / GB,
    minimumContainerSize: 4 * GB,
    maximumContainerSize: 653 * GB,
    maximumContainerCount: 32,
  },
  c4: {
    name: "Compute Optimized (C) - Legacy",
    costPerContainerHourInCents: 10,
    cpuShare: 0.5 / GB,
    minimumContainerSize: 2 * GB,
    maximumContainerSize: 58 * GB,
    maximumContainerCount: 32,
  },
  c5: {
    name: "Compute Optimized (C)",
    costPerContainerHourInCents: 10,
    cpuShare: 0.5 / GB,
    minimumContainerSize: 2 * GB,
    maximumContainerSize: 163 * GB,
    maximumContainerCount: 32,
  },
};
