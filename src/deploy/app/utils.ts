import type { InstanceClass } from "@app/types";
import { CONTAINER_PROFILES, GB } from "../container/utils";

type SizeMap = {
  [key in InstanceClass]: number[];
};

const getContainerSizesByProfile = (profile: InstanceClass): number[] => {
  const sizeMap: SizeMap = {
    m4: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    m5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    m: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    r4: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240],
    r5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368, 496, 752],
    r: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368, 496, 752],
    c4: [0.5, 1, 2, 4, 7, 15, 30],
    c5: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368],
    c: [0.5, 1, 2, 4, 7, 15, 30, 60, 150, 240, 368],
  };
  return sizeMap[profile].map((size: number) => size * GB);
};

export const containerSizesByProfile = (profile: InstanceClass): number[] => {
  const profileSizes = getContainerSizesByProfile(profile);
  return profileSizes.filter(
    (size: number) => size >= CONTAINER_PROFILES[profile].minimumContainerSize,
  );
};
