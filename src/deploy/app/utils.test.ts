import { CONTAINER_PROFILES } from "../container/utils";
import { hourlyAndMonthlyCostsForContainers } from "./utils";

describe("hourlyAndMonthlyCostsForContainers", () => {
  it("should test for regular m series container profile", () => {
    const { pricePerHour, pricePerMonth } = hourlyAndMonthlyCostsForContainers(
      2,
      CONTAINER_PROFILES.m4,
      1024,
    );
    expect(pricePerHour).toBe("0.08");
    expect(pricePerMonth).toBe(116.96);
  });
  it("should test for regular r series container profile", () => {
    const { pricePerHour, pricePerMonth } = hourlyAndMonthlyCostsForContainers(
      2,
      CONTAINER_PROFILES.r5,
      1024,
    );
    expect(pricePerHour).toBe("0.05");
    expect(pricePerMonth).toBe(73.1);
  });
  it("should test for regular m series container profile with disks", () => {
    const { pricePerHour, pricePerMonth } = hourlyAndMonthlyCostsForContainers(
      2,
      CONTAINER_PROFILES.r5,
      1024,
      500,
    );
    expect(pricePerHour).toBe("0.05");
    expect(pricePerMonth).toBe(173.1);
  });
});
