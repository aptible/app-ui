import { type WebState, defaultDeployOperation } from "@app/schema";
import type { DeepPartial } from "@app/types";
import { selectScaleDiff } from ".";

describe("selectScaleDiff", () => {
  it("should return default ops when none available for service", () => {
    const serviceId = "111";
    const state: DeepPartial<WebState> = { operations: {} };
    const actual = selectScaleDiff(state as any, { id: serviceId });
    expect(actual.latest).toBeTruthy();
    expect(actual.prev).toBeTruthy();
  });

  it("should return scale diff", () => {
    const serviceId = "111";
    const now = new Date();
    const yday = new Date();
    yday.setDate(yday.getDate() - 1);

    const op1 = defaultDeployOperation({
      id: "1",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: yday.toISOString(),
      updatedAt: yday.toISOString(),
    });
    const op2 = defaultDeployOperation({
      id: "2",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    const state: DeepPartial<WebState> = {
      operations: {
        [op1.id]: op1,
        [op2.id]: op2,
      },
    };
    const actual = selectScaleDiff(state as any, { id: serviceId });
    expect(actual).toEqual({ latest: op2, prev: op1 });
  });

  it("should try to figure out previous scale details", () => {
    const serviceId = "111";
    const now = new Date();
    const yday = new Date();
    yday.setDate(yday.getDate() - 1);
    const two = new Date();
    two.setDate(two.getDate() - 2);
    const three = new Date();
    three.setDate(three.getDate() - 3);

    const op1 = defaultDeployOperation({
      id: "1",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: three.toISOString(),
      updatedAt: three.toISOString(),
      instanceProfile: "c5",
      containerSize: 1024,
      containerCount: 0,
    });
    const op2 = defaultDeployOperation({
      id: "2",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: two.toISOString(),
      updatedAt: two.toISOString(),
      containerCount: 1,
    });
    const op3 = defaultDeployOperation({
      id: "3",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: yday.toISOString(),
      updatedAt: yday.toISOString(),
      containerSize: 2048,
      containerCount: 2,
    });
    const op4 = defaultDeployOperation({
      id: "4",
      resourceType: "service",
      resourceId: serviceId,
      type: "scale",
      status: "succeeded",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      instanceProfile: "r5",
    });

    const state: DeepPartial<WebState> = {
      operations: {
        [op1.id]: op1,
        [op2.id]: op2,
        [op3.id]: op3,
        [op4.id]: op4,
      },
    };
    const actual = selectScaleDiff(state as any, { id: serviceId });
    expect(actual.latest.instanceProfile).toEqual("r5");
    expect(actual.latest.containerCount).toEqual(2);
    expect(actual.latest.containerSize).toEqual(2048);
    expect(actual.prev.instanceProfile).toEqual("c5");
    expect(actual.prev.containerCount).toEqual(2);
    expect(actual.prev.containerSize).toEqual(2048);
  });
});
