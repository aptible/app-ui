import {
  type WebState,
  defaultCostRates,
  defaultDeployBackup,
  defaultDeployDisk,
  defaultDeployEndpoint,
  defaultDeployService,
} from "@app/schema";
import { estimateMonthlyCost, hoursPerMonth } from "./calc";

describe("estimateMonthlyCost", () => {
  const rates = defaultCostRates();
  const state: Partial<WebState> = {
    costRates: rates,
  };

  it("should calculate the cost of containers", () => {
    const monthlyCost = estimateMonthlyCost(state as any, {
      services: [
        defaultDeployService({
          containerCount: 2,
          containerMemoryLimitMb: 2048,
          instanceClass: "r5",
        }),
        defaultDeployService({
          containerCount: 1,
          containerMemoryLimitMb: 1024,
          instanceClass: "r5",
        }),
      ],
      disks: [],
      endpoints: [],
      backups: [],
    });

    expect(monthlyCost).toBeCloseTo(
      ((5 * rates.r_class_gb_per_hour)) * hoursPerMonth,
    );
  });

  it("should calculate the cost of disks", () => {
    const monthlyCost = estimateMonthlyCost(state as any, {
      services: [],
      disks: [
        defaultDeployDisk({ size: 3, provisionedIops: 4000 }),
        defaultDeployDisk({ size: 2, provisionedIops: 2000 }),
      ],
      endpoints: [],
      backups: [],
    });
    expect(monthlyCost).toBeCloseTo(
      5 * rates.disk_cost_gb_per_month + 1000 * rates.disk_iops_cost_per_month,
    );
  });

  it("should calculate the cost of endpoints", () => {
    const monthlyCost = estimateMonthlyCost(state as any, {
      services: [],
      disks: [],
      endpoints: [
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
      ],
      backups: [],
    });

    expect(monthlyCost).toBeCloseTo(
      3 * rates.vhost_cost_per_hour * hoursPerMonth,
    );
  });

  it("should calculate the cost of backups", () => {
    const monthlyCost = estimateMonthlyCost(state as any, {
      services: [],
      disks: [],
      endpoints: [],
      backups: [
        defaultDeployBackup({ size: 5 }),
        defaultDeployBackup({ size: 10 }),
      ],
    });

    expect(monthlyCost).toBeCloseTo(15 * rates.backup_cost_gb_per_month);
  });

  it("should calculate the cost of everything", () => {
    const monthlyCost = estimateMonthlyCost(state as any, {
      services: [
        defaultDeployService({
          containerCount: 2,
          containerMemoryLimitMb: 2048,
          instanceClass: "r5",
        }),
        defaultDeployService({
          containerCount: 1,
          containerMemoryLimitMb: 1024,
          instanceClass: "r5",
        }),
      ],
      disks: [
        defaultDeployDisk({ size: 3, provisionedIops: 4000 }),
        defaultDeployDisk({ size: 2, provisionedIops: 2000 }),
      ],
      endpoints: [
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
        defaultDeployEndpoint(),
      ],
      backups: [
        defaultDeployBackup({ size: 5 }),
        defaultDeployBackup({ size: 10 }),
      ],
    });

    let expectedHourly = (5 * rates.r_class_gb_per_hour);
    expectedHourly += 3 * rates.vhost_cost_per_hour;

    let expectedMonthly = expectedHourly * hoursPerMonth;
    expectedMonthly +=
      5 * rates.disk_cost_gb_per_month + 1000 * rates.disk_iops_cost_per_month;
    expectedMonthly += 15 * rates.backup_cost_gb_per_month;

    expect(monthlyCost).toBeCloseTo(expectedMonthly, 5);
  });
});
