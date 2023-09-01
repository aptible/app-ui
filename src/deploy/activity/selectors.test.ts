import { dateFromToday } from "@app/date";
import { createId, testOrg } from "@app/mocks";
import { AppState, DeepPartial, DeployOperation } from "@app/types";
import { defaultDeployApp } from "../app";
import { defaultDeployDatabase } from "../database";
import { defaultDeployEndpoint } from "../endpoint";
import { defaultDeployEnvironment } from "../environment";
import { defaultDeployOperation } from "../operation";
import { selectActivityForTableSearch } from "./index";

const env1 = defaultDeployEnvironment({
  id: `${createId()}`,
  handle: "my-env",
  organizationId: testOrg.id,
});
const env2 = defaultDeployEnvironment({
  id: `${createId()}`,
  handle: "your-env",
  organizationId: testOrg.id,
});

const app1 = defaultDeployApp({
  id: `${createId()}`,
  environmentId: env1.id,
  handle: "first app",
});
const op1 = defaultDeployOperation({
  id: `${createId()}`,
  resourceId: app1.id,
  resourceType: "app",
  type: "deploy",
  environmentId: env1.id,
  createdAt: dateFromToday(-2).toISOString(),
});

const db1 = defaultDeployDatabase({
  id: `${createId()}`,
  handle: "first db for app",
  environmentId: env2.id,
});
const op2 = defaultDeployOperation({
  id: `${createId()}`,
  resourceId: db1.id,
  resourceType: "database",
  type: "provision",
  environmentId: env2.id,
  createdAt: new Date().toISOString(),
});

const vhost1 = defaultDeployEndpoint({
  id: `${createId()}`,
  serviceId: "",
});
const op3 = defaultDeployOperation({
  id: `${createId()}`,
  resourceId: vhost1.id,
  resourceType: "vhost",
  type: "provision",
  environmentId: env2.id,
  createdAt: dateFromToday(-1).toISOString(),
});
const state: DeepPartial<AppState> = {
  deploy: {
    operations: { [op1.id]: op1, [op2.id]: op2, [op3.id]: op3 },
    environments: { [env1.id]: env1, [env2.id]: env2 },
    apps: { [app1.id]: app1 },
    databases: { [db1.id]: db1 },
    endpoints: { [vhost1.id]: vhost1 },
  },
  organizationSelected: testOrg.id,
};

const op1Row = { ...op1, envHandle: env1.handle, resourceHandle: app1.handle };
const op2Row = { ...op2, envHandle: env2.handle, resourceHandle: db1.handle };
const op3Row = { ...op3, envHandle: env2.handle, resourceHandle: vhost1.id };

const createOps = (n: number) => {
  const ops: { [key: string]: DeployOperation } = {};
  for (let i = 0; i < n; i += 1) {
    const id = `${createId()}`;
    ops[id] = defaultDeployOperation({
      id,
      environmentId: env1.id,
    });
  }
  return ops;
};

describe("selectActivityForTableSearch", () => {
  describe("when search is empty", () => {
    it("should return latest 50 operations", () => {
      const ops = createOps(100);
      const actual = selectActivityForTableSearch(
        { ...state, deploy: { ...state.deploy, operations: ops } } as any,
        { search: "" },
      );
      expect(actual.length).toBe(50);
    });

    it("should return latest operations", () => {
      const actual = selectActivityForTableSearch(state as any, { search: "" });
      expect(actual).toEqual([op2Row, op3Row, op1Row]);
    });

    describe("when filtering by `envId`", () => {
      it("should keep only operations within an environment", () => {
        const actual = selectActivityForTableSearch(state as any, {
          search: "",
          envId: env2.id,
        });
        expect(actual).toEqual([op2Row, op3Row]);
      });
    });

    describe("when filtering by `resourceId`", () => {
      it("should keep only operations within resource", () => {
        const actual = selectActivityForTableSearch(state as any, {
          search: "",
          resourceIds: [app1.id],
        });
        expect(actual).toEqual([op1Row]);
      });
    });
  });

  describe("when search is `app`", () => {
    it("should perform a grep across data properties", () => {
      const actual = selectActivityForTableSearch(state as any, {
        search: "app",
      });
      expect(actual).toEqual([op2Row, op1Row]);
    });

    describe("when filtering by `envId`", () => {
      it("should keep only operations within an environment", () => {
        const actual = selectActivityForTableSearch(state as any, {
          search: "app",
          envId: env2.id,
        });
        expect(actual).toEqual([op2Row]);
      });
    });
  });

  describe("when search is `your-env`", () => {
    it("should find all operations within that environment", () => {
      const actual = selectActivityForTableSearch(state as any, {
        search: "your-env",
      });
      expect(actual).toEqual([op2Row, op3Row]);
    });
  });
});
