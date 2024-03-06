import { ContainerProfileData, InstanceClass } from "@app/types";
import { CONTAINER_PROFILES, GB } from "../container/utils";

type SizeMap = {
  [key in InstanceClass]: number[];
};

const getContainerSizesByProfile = (profile: InstanceClass): number[] => {
  const sizeMap: SizeMap = {
    m4: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    m5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    r4: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    r5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368, 496, 752],
    c4: [0.5, 1, 2, 4, 7, 15, 30],
    c5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368],
  };
  return sizeMap[profile].map((size: number) => size * GB);
};

export const containerSizesByProfile = (profile: InstanceClass): number[] => {
  const profileSizes = getContainerSizesByProfile(profile);
  return profileSizes.filter(
    (size: number) => size >= CONTAINER_PROFILES[profile].minimumContainerSize,
  );
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
