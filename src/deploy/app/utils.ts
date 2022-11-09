import { DeployService } from "@app/types";

export const GB = 1024;
const ABSOLUTE_MAX_CONTAINER_SIZE_IN_GB = 653;
const getContainerSizes = () => {
  const containerSizes = [GB / 4, GB / 2]; // Container sizes start at 512?

  for (let i = 1; i <= ABSOLUTE_MAX_CONTAINER_SIZE_IN_GB; i++) {
    containerSizes.push(GB * i);
  }
  return containerSizes;
};

export const LINEAR_CONTAINER_SIZES = getContainerSizes();
export const EXPONENTIAL_CONTAINER_SIZES = [
  GB / 2,
  GB,
  2 * GB,
  4 * GB,
  7 * GB,
  15 * GB,
  30 * GB,
  60 * GB,
  150 * GB,
  240 * GB,
];
export const CONTAINER_PROFILES = {
  t3: {
    name: "Economy (T)",
    costPerContainerHourInCents: 3.5,
    cpuShare: 0.5 / GB,
    minimumContainerSize: GB / 4,
    maximumContainerSize: 27 * GB,
    maximumContainerCount: 32,
  },
  m4: {
    name: "General Purpose (M)",
    costPerContainerHourInCents: 8,
    cpuShare: 0.25 / GB,
    minimumContainerSize: GB / 2,
    maximumContainerSize: 217 * GB,
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

export const calcMetrics = (services: DeployService[]) => {
  const totalMemoryLimit = () => {
    let total = 0;
    services.forEach((s) => {
      total += s.containerMemoryLimitMb;
    });
    return total;
  };

  const totalCPU = () => {
    let total = 0;
    services.forEach((s) => {
      total += (s.containerMemoryLimitMb / 1024) * 0.25;
    });
    return total;
  };

  return {
    totalCPU: totalCPU(),
    totalMemoryLimit: totalMemoryLimit(),
  };
};
