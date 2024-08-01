import { CONTAINER_PROFILES } from "./container";
import {
  backupCostPerGBHour,
  calculateCost,
  diskCostPerGBMonth,
  diskIopsCostPerMonth,
  endpointCostPerHour,
  hoursPerMonth,
  stackCostPerMonth,
  vpnTunnelCostPerMonth,
} from "./cost";

describe("calculateCost", () => {
  it("should calculate the cost of containers", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
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

    expect(hourlyCost).toBeCloseTo(
      (5 * CONTAINER_PROFILES.r5.costPerContainerGBHourInCents) / 100,
    );
    expect(monthlyCost).toBeCloseTo(hourlyCost * hoursPerMonth);
  });

  it("should calculate the cost of disks", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
      disks: [
        { size: 3, provisionedIops: 4000 },
        { size: 2, provisionedIops: 2000 },
      ],
    });

    expect(hourlyCost).toBeCloseTo(0);
    expect(monthlyCost).toBeCloseTo(
      5 * diskCostPerGBMonth + 1000 * diskIopsCostPerMonth,
    );
  });

  it("should calculate the cost of endpoints", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
      endpoints: [{}, {}, {}],
    });

    expect(hourlyCost).toBeCloseTo(3 * endpointCostPerHour);
    expect(monthlyCost).toBeCloseTo(hourlyCost * hoursPerMonth);
  });

  it("should calculate the cost of backups", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
      backups: [{ size: 5 }, { size: 10 }],
    });

    expect(hourlyCost).toBeCloseTo(15 * backupCostPerGBHour);
    expect(monthlyCost).toBeCloseTo(hourlyCost * hoursPerMonth);
  });

  it("should calculate the cost of VPN tunnels", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
      vpn_tunnels: [{}, {}, {}, {}],
    });

    expect(hourlyCost).toBeCloseTo(0);
    expect(monthlyCost).toBeCloseTo(4 * vpnTunnelCostPerMonth);
  });

  it("should calculate the cost of stacks", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
      stacks: [{}, {}, {}, {}, {}],
    });

    expect(hourlyCost).toBeCloseTo(0);
    expect(monthlyCost).toBeCloseTo(5 * stackCostPerMonth);
  });

  it("should calculate the cost of everything", () => {
    const { hourlyCost, monthlyCost } = calculateCost({
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
      vpn_tunnels: [{}, {}, {}, {}],
      stacks: [{}, {}, {}, {}, {}],
    });

    let expectedHourly =
      (5 * CONTAINER_PROFILES.r5.costPerContainerGBHourInCents) / 100;
    expectedHourly += 3 * endpointCostPerHour;
    expectedHourly += 15 * backupCostPerGBHour;

    let expectedMonthly = hourlyCost * hoursPerMonth;
    expectedMonthly += 5 * diskCostPerGBMonth + 1000 * diskIopsCostPerMonth;
    expectedMonthly += 4 * vpnTunnelCostPerMonth;
    expectedMonthly += 5 * stackCostPerMonth;

    expect(hourlyCost).toBeCloseTo(expectedHourly, 5);
    expect(monthlyCost).toBeCloseTo(expectedMonthly, 5);
  });
});
