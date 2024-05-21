// @vitest-environment: node

import {
  WebState,
  defaultDeployApp,
  defaultDeployAppConfig,
  defaultDeployDatabase,
  defaultDeployEnvironment,
  defaultDeployStack,
} from "@app/schema";
import { selectDependencies } from "./index";

// TODO: Test finding apps and databases through endpoints
describe("selectDependencies", () => {
  describe("aptible.in", () => {
    const domain = "aptible.in";

    it("should find aptible databases in app configuration", () => {
      const stack = defaultDeployStack({
        id: "stack-id",
        internalDomain: domain,
      });
      const env = defaultDeployEnvironment({
        id: "env-id",
        stackId: "stack-id",
      });
      const app = defaultDeployApp({
        id: "app-id",
        environmentId: "env-id",
        currentConfigurationId: "app-config-id",
      });
      const appConfig = defaultDeployAppConfig({
        id: "app-config-id",
        appId: "app-id",
        env: {
          DATABASE_URL: `postgres://aptible:pass@db-aptible-us-east-1-1234.${domain}:5432/db`,
          RANDOM: `redis://aptible:pass@db-aptible-use-east-1-5555.${domain}:6379`,
        },
      });
      const db1 = defaultDeployDatabase({
        id: "1234",
        environmentId: "env-id",
      });
      const db2 = defaultDeployDatabase({
        id: "5555",
        environmentId: "env-id",
      });
      const db3 = defaultDeployDatabase({
        id: "6666",
        environmentId: "env-id",
      });

      const state: Partial<WebState> = {
        stacks: { [stack.id]: stack },
        environments: { [env.id]: env },
        apps: { [app.id]: app },
        appConfigs: { [appConfig.id]: appConfig },
        databases: { [db1.id]: db1, [db2.id]: db2, [db3.id]: db3 },
        services: {},
        endpoints: {},
      };

      const actual = selectDependencies(state, { id: "app-id" }).map(
        (dep) => dep.refId,
      );
      expect(actual).toEqual(["1234", "5555"]);
    });
  });

  describe("aptible-katana.com", () => {
    const domain = "aptible-katana.com";

    it("should find aptible databasesin app configuration", () => {
      const stack = defaultDeployStack({
        id: "stack-id",
        internalDomain: domain,
      });
      const env = defaultDeployEnvironment({
        id: "env-id",
        stackId: "stack-id",
      });
      const app = defaultDeployApp({
        id: "app-id",
        environmentId: "env-id",
        currentConfigurationId: "app-config-id",
      });
      const appConfig = defaultDeployAppConfig({
        id: "app-config-id",
        appId: "app-id",
        env: {
          DATABASE_URL: `postgres://aptible:pass@db-aptible-us-east-1-1234.${domain}:5432/db`,
          RANDOM: `redis://aptible:pass@db-aptible-use-east-1-5555.${domain}:6379`,
        },
      });
      const db1 = defaultDeployDatabase({
        id: "1234",
        environmentId: "env-id",
      });
      const db2 = defaultDeployDatabase({
        id: "5555",
        environmentId: "env-id",
      });
      const db3 = defaultDeployDatabase({
        id: "6666",
        environmentId: "env-id",
      });

      const state: Partial<WebState> = {
        stacks: { [stack.id]: stack },
        environments: { [env.id]: env },
        apps: { [app.id]: app },
        appConfigs: { [appConfig.id]: appConfig },
        databases: { [db1.id]: db1, [db2.id]: db2, [db3.id]: db3 },
        services: {},
        endpoints: {},
      };

      const actual = selectDependencies(state, { id: "app-id" }).map(
        (dep) => dep.refId,
      );
      expect(actual).toEqual(["1234", "5555"]);
    });
  });

  describe("aptible-angel-studios.com", () => {
    const domain = "aptible-angel-studios.com";

    it("should find aptible databasesin app configuration", () => {
      const stack = defaultDeployStack({
        id: "stack-id",
        internalDomain: domain,
      });
      const env = defaultDeployEnvironment({
        id: "env-id",
        stackId: "stack-id",
      });
      const app = defaultDeployApp({
        id: "app-id",
        environmentId: "env-id",
        currentConfigurationId: "app-config-id",
      });
      const appConfig = defaultDeployAppConfig({
        id: "app-config-id",
        appId: "app-id",
        env: {
          DATABASE_URL: `postgres://aptible:pass@db-aptible-us-east-1-1234.${domain}:5432/db`,
          RANDOM: `redis://aptible:pass@db-aptible-use-east-1-5555.${domain}:6379`,
        },
      });
      const db1 = defaultDeployDatabase({
        id: "1234",
        environmentId: "env-id",
      });
      const db2 = defaultDeployDatabase({
        id: "5555",
        environmentId: "env-id",
      });
      const db3 = defaultDeployDatabase({
        id: "6666",
        environmentId: "env-id",
      });

      const state: Partial<WebState> = {
        stacks: { [stack.id]: stack },
        environments: { [env.id]: env },
        apps: { [app.id]: app },
        appConfigs: { [appConfig.id]: appConfig },
        databases: { [db1.id]: db1, [db2.id]: db2, [db3.id]: db3 },
        services: {},
        endpoints: {},
      };

      const actual = selectDependencies(state, { id: "app-id" }).map(
        (dep) => dep.refId,
      );
      expect(actual).toEqual(["1234", "5555"]);
    });
  });
});
