import { createId, testServiceRails } from "@app/mocks";
import {
  WebState,
  defaultDeployRelease,
  defaultDeployService,
} from "@app/schema";
import { DeployService } from "@app/types";
import { selectReleasesByServiceAfterDate } from "./index";

const createdAtByHours = ({ hours }: { hours: number }) => {
  const createdAt = new Date();
  createdAt.setHours(createdAt.getHours() + hours);
  return createdAt.toISOString();
};

const testService: DeployService = defaultDeployService({
  id: testServiceRails.id.toString(),
});

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const state: DeepPartial<WebState> = {
  services: { [testService.id]: testService },
  releases: {},
};

describe("selectReleasesByServiceAfterDate", () => {
  const release1 = defaultDeployRelease({
    id: `${createId()}`,
    serviceId: testServiceRails.id.toString(),
    createdAt: createdAtByHours({ hours: -1 }),
  });
  const release2 = defaultDeployRelease({
    id: `${createId()}`,
    serviceId: testServiceRails.id.toString(),
    createdAt: createdAtByHours({ hours: -3 }),
  });
  const release3 = defaultDeployRelease({
    id: `${createId()}`,
    serviceId: testServiceRails.id.toString(),
    createdAt: createdAtByHours({ hours: -5 }),
  });

  const releases = {
    [release1.id]: release1,
    [release2.id]: release2,
    [release3.id]: release3,
  };
  describe("when releases are present (createAt before date (deleted), createdAt after date (deleted), createdAt (active))", () => {
    it("should return 3 releases (all three before cutoff)", () => {
      const date = createdAtByHours({ hours: -6 });
      const actual = selectReleasesByServiceAfterDate(
        { ...state, releases } as any,
        {
          id: testServiceRails.id.toString(),
          date,
        },
      );
      expect(actual.length).toBe(3);
    });
    it("should return 3 releases (2 out of range of createdAt, but one is overlapping)", () => {
      const date = createdAtByHours({ hours: -4 });
      const actual = selectReleasesByServiceAfterDate(
        { ...state, releases } as any,
        {
          id: testServiceRails.id.toString(),
          date,
        },
      );
      expect(actual.length).toBe(3);
    });
    it("should return 2 releases (1 out of range of createdAt, but one is overlapping)", () => {
      const date = createdAtByHours({ hours: -3 });
      const actual = selectReleasesByServiceAfterDate(
        { ...state, releases } as any,
        {
          id: testServiceRails.id.toString(),
          date,
        },
      );
      expect(actual.length).toBe(2);
    });
    it("should return 1 release (only current)", () => {
      const date = createdAtByHours({ hours: 1 });
      const actual = selectReleasesByServiceAfterDate(
        { ...state, releases } as any,
        {
          id: testServiceRails.id.toString(),
          date,
        },
      );
      expect(actual.length).toBe(1);
    });
  });
});
