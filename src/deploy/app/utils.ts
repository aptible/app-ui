import { CONTAINER_PROFILES, GB } from "../container/utils";
import { ContainerProfileData, DeployService, InstanceClass } from "@app/types";

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

export const exponentialContainerSizesByProfile = (
  profile: InstanceClass,
): number[] =>
  EXPONENTIAL_CONTAINER_SIZES.filter(
    (size) => size >= CONTAINER_PROFILES[profile].minimumContainerSize,
  );
export const getContainerProfileFromType = (
  containerProfile: InstanceClass,
): ContainerProfileData => {
  if (!CONTAINER_PROFILES[containerProfile]) {
    return {
      name: "",
      costPerContainerHourInCents: 0,
      cpuShare: 0,
      minimumContainerSize: 0,
      maximumContainerSize: 0,
      maximumContainerCount: 0,
    };
  }
  return CONTAINER_PROFILES[containerProfile];
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
      total +=
        s.containerMemoryLimitMb *
        getContainerProfileFromType(s.instanceClass).cpuShare;
    });
    return total;
  };

  return {
    totalCPU: totalCPU(),
    totalMemoryLimit: totalMemoryLimit(),
  };
};

export const hoursPerMonth = 731;
export const computedCostsForContainer = (
  containerCount: number,
  containerProfile: ContainerProfileData,
  containerSizeGB: number,
) => {
  const estimatedCostInCents = () => {
    const { costPerContainerHourInCents } = containerProfile;
    return (
      hoursPerMonth *
      containerCount *
      ((containerSizeGB / 1024) * 1000) *
      costPerContainerHourInCents
    );
  };
  const estimatedCostInDollars = estimatedCostInCents() / 100;
  return {
    estimatedCostInCents,
    estimatedCostInDollars,
  };
};

export const hourlyAndMonthlyCostsForContainers = (
  containerCount: number,
  containerProfile: ContainerProfileData,
  containerSize: number,
  diskSize?: number,
) => {
  const pricePerHour = (
    containerProfile.costPerContainerHourInCents / 100
  ).toFixed(2);
  let pricePerMonth =
    computedCostsForContainer(containerCount, containerProfile, containerSize)
      .estimatedCostInDollars / 1000;
  if (diskSize) {
    pricePerMonth += diskSize * 0.2;
  }
  return {
    pricePerHour,
    pricePerMonth: pricePerMonth.toFixed(2),
  };
};
