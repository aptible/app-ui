import { defaultCostRates, defaultDeployEndpoint } from "@app/schema";
import { estimateMonthlyCost, hoursPerMonth } from "./calc";

describe("estimateMonthlyCost", () => {
  const rates = defaultCostRates();

  it("should calculate the cost of containers", () => {
    const monthlyCost = estimateMonthlyCost({
      rates,
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
      5 * rates.r_class_gb_per_hour * hoursPerMonth,
    );
  });

  it("should calculate the cost of disks", () => {
    const monthlyCost = estimateMonthlyCost({
      rates,
      disks: [
        { size: 3, provisionedIops: 4000 },
        { size: 2, provisionedIops: 2000 },
      ],
    });
    expect(monthlyCost).toBeCloseTo(
      5 * rates.disk_cost_gb_per_month + 1000 * rates.disk_iops_cost_per_month,
    );
  });

  it("should calculate the cost of endpoints", () => {
    const monthlyCost = estimateMonthlyCost({
      rates,
      endpoints: [
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
      ],
    });

    expect(monthlyCost).toBeCloseTo(
      3 * rates.vhost_cost_per_hour * hoursPerMonth,
    );
  });

  it("should calculate the cost of backups", () => {
    const monthlyCost = estimateMonthlyCost({
      rates,
      backups: [{ size: 5 }, { size: 10 }],
    });

    expect(monthlyCost).toBeCloseTo(15 * rates.backup_cost_gb_per_month);
  });

  it("should calculate the cost of everything", () => {
    const monthlyCost = estimateMonthlyCost({
      rates,
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
      endpoints: [
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
      ],
      backups: [{ size: 5 }, { size: 10 }],
    });

    let expectedHourly = 5 * rates.r_class_gb_per_hour;
    expectedHourly += 3 * rates.vhost_cost_per_hour;

    let expectedMonthly = expectedHourly * hoursPerMonth;
    expectedMonthly +=
      5 * rates.disk_cost_gb_per_month + 1000 * rates.disk_iops_cost_per_month;
    expectedMonthly += 15 * rates.backup_cost_gb_per_month;

    expect(monthlyCost).toBeCloseTo(expectedMonthly, 5);
  });
});
