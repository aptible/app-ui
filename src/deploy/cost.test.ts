import { CONTAINER_PROFILES } from "./container";
import {
  backupCostPerGBHour,
  diskCostPerGBMonth,
  diskIopsCostPerMonth,
  endpointCostPerHour,
  estimateMonthlyCost,
  hoursPerMonth,
  stackCostPerMonth,
  vpnTunnelCostPerMonth,
} from "./cost";

describe("estimateMonthlyCost", () => {
  it("should calculate the cost of containers", () => {
    const monthlyCost = estimateMonthlyCost({
      services: [
        {
          containerCount: 2,
          containerMemoryLimitMb: 2048,
          instanceClass: "r5",
        },
        {
          containerCount: 1,
          containerMemoryLimitMb: 1024,
          instanceClass: "r5",
        },
      ],
    });

    expect(monthlyCost).toBeCloseTo(
      ((5 * CONTAINER_PROFILES.r5.costPerContainerGBHourInCents) / 100) *
        hoursPerMonth,
    );
  });

  it("should calculate the cost of disks", () => {
    const monthlyCost = estimateMonthlyCost({
      disks: [
        { size: 3, provisionedIops: 4000 },
        { size: 2, provisionedIops: 2000 },
      ],
    });
    expect(monthlyCost).toBeCloseTo(
      5 * diskCostPerGBMonth + 1000 * diskIopsCostPerMonth,
    );
  });

  it("should calculate the cost of endpoints", () => {
    const monthlyCost = estimateMonthlyCost({
      endpoints: [{}, {}, {}],
    });

    expect(monthlyCost).toBeCloseTo(3 * endpointCostPerHour * hoursPerMonth);
  });

  it("should calculate the cost of backups", () => {
    const monthlyCost = estimateMonthlyCost({
      backups: [{ size: 5 }, { size: 10 }],
    });

    expect(monthlyCost).toBeCloseTo(15 * backupCostPerGBHour * hoursPerMonth);
  });

  it("should calculate the cost of VPN tunnels", () => {
    const monthlyCost = estimateMonthlyCost({
      vpnTunnels: [{}, {}, {}, {}],
    });

    expect(monthlyCost).toBeCloseTo(4 * vpnTunnelCostPerMonth);
  });

  it("should calculate the cost of dedicated stacks", () => {
    const monthlyCost = estimateMonthlyCost({
      stacks: [
        { organizationId: "abc" },
        { organizationId: "123" },
        { organizationId: "" },
      ],
    });

    expect(monthlyCost).toBeCloseTo(2 * stackCostPerMonth);
  });

  it("should calculate the cost of everything", () => {
    const monthlyCost = estimateMonthlyCost({
      services: [
        {
          containerCount: 2,
          containerMemoryLimitMb: 2048,
          instanceClass: "r5",
        },
        {
          containerCount: 1,
          containerMemoryLimitMb: 1024,
          instanceClass: "r5",
        },
      ],
      disks: [
        { size: 3, provisionedIops: 4000 },
        { size: 2, provisionedIops: 2000 },
      ],
      endpoints: [{}, {}, {}],
      backups: [{ size: 5 }, { size: 10 }],
      vpnTunnels: [{}, {}, {}, {}],
      stacks: [
        { organizationId: "abc" },
        { organizationId: "123" },
        { organizationId: "" },
      ],
    });

    let expectedHourly =
      (5 * CONTAINER_PROFILES.r5.costPerContainerGBHourInCents) / 100;
    expectedHourly += 3 * endpointCostPerHour;
    expectedHourly += 15 * backupCostPerGBHour;

    let expectedMonthly = expectedHourly * hoursPerMonth;
    expectedMonthly += 5 * diskCostPerGBMonth + 1000 * diskIopsCostPerMonth;
    expectedMonthly += 4 * vpnTunnelCostPerMonth;
    expectedMonthly += 2 * stackCostPerMonth;

    expect(monthlyCost).toBeCloseTo(expectedMonthly, 5);
  });
});
