import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { schema } from "@app/schema";
import { TextVal } from "@app/string-utils";
import {
  DeployApp,
  DeployAppConfig,
  DeployAppConfigEnv,
  DeployDatabase,
  DeployService,
  LinkResponse,
} from "@app/types";
import { DeployEndpoint } from "@app/types";
import { parse } from "dotenv";
import { IdProp } from "starfx";
import { findServiceById, selectEndpointsAsList, selectServices } from "..";
import { findAppById, selectAppById, selectApps } from "../app";
import { findDatabaseById, selectDatabases } from "../database";

export interface DeployConfigurationResponse {
  id: number;
  env: { [key: string]: string | null } | null;
  _links: {
    resource: LinkResponse;
  };
  _type: "configuration";
}

export const defaultConfigurationResponse = (
  c: Partial<DeployConfigurationResponse> = {},
): DeployConfigurationResponse => {
  return {
    id: 0,
    env: {},
    _links: {
      resource: defaultHalHref(),
    },
    _type: "configuration",
    ...c,
  };
};

export const deserializeAppConfig = (
  resp: DeployConfigurationResponse,
): DeployAppConfig => {
  return {
    id: `${resp.id}`,
    env: resp.env || {},
    appId: extractIdFromLink(resp._links.resource),
  };
};

export const configEnvToStr = (env: DeployAppConfigEnv): string => {
  return Object.keys(env)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      let value = String.raw`${env[key]}`;
      const prev = acc ? `${acc}\n` : "";
      if (value.includes("\n")) {
        value = `"${value}"`;
      }
      return `${prev}${key}=${value}`;
    }, "");
};

export const configStrToEnvList = (text: string): TextVal[] => {
  const items: TextVal[] = [];
  const output = parse(text);
  Object.keys(output).forEach((key) => {
    items.push({ key, value: output[key], meta: {} });
  });
  return items;
};

export const configEnvListToEnv = (
  next: TextVal[],
  cur: DeployAppConfigEnv = {},
): DeployAppConfigEnv => {
  const env: DeployAppConfigEnv = {};
  // the way to "remove" env vars from config is to set them as empty
  // so we do that here
  Object.keys(cur).forEach((key) => {
    env[key] = "";
  });

  next.forEach((e) => {
    env[e.key] = e.value;
  });

  return env;
};

export const selectAppConfigById = schema.appConfigs.selectById;

export const selectAppConfigByAppId = createSelector(
  schema.appConfigs.selectTable,
  selectAppById,
  (configs, app) =>
    schema.appConfigs.findById(configs, { id: app.currentConfigurationId }),
);

export interface DependencyNode {
  type: string;
  why: string;
  refId: string;
  name: string;
}

export interface AppDependency extends DependencyNode {
  type: "app";
  resource: DeployApp;
}

export interface DatabaseDependency extends DependencyNode {
  type: "database";
  resource: DeployDatabase;
}

export type Dependency = AppDependency | DatabaseDependency;

function findDeps(
  config: DeployAppConfig,
  apps: Record<IdProp, DeployApp>,
  dbs: Record<IdProp, DeployDatabase>,
  services: Record<IdProp, DeployService>,
  endpoints: DeployEndpoint[],
): Dependency[] {
  const deps: Dependency[] = [];

  Object.entries(config.env).forEach(([key, value]) => {
    if (value == null) return;

    const domainMatch = /([a-zA-Z0-6_-]{1,64}\.)+[a-zA-Z]{1,16}/.exec(value);
    if (domainMatch == null) return;
    const domain = domainMatch[0];

    const dbMatch = /db-[a-zA-Z0-6_-]+-([0-9]+)\./.exec(domain);
    if (dbMatch && dbMatch.length > 1) {
      const db = findDatabaseById(dbs, { id: dbMatch[1] });

      if (db) {
        deps.push({
          why: key,
          refId: dbMatch[1],
          name: db.handle,
          type: "database",
          resource: db,
        });
        return;
      }
    }

    const endpoint = endpoints.find(
      (e) => domain === e.virtualDomain || domain === e.externalHost,
    );
    if (endpoint == null) return;
    const service = findServiceById(services, { id: endpoint.serviceId });

    if (service.appId != null) {
      const app = findAppById(apps, { id: service.appId });

      deps.push({
        why: key,
        refId: app.id,
        name: app.handle,
        type: "app",
        resource: app,
      });
    } else if (service.databaseId != null) {
      const db = findDatabaseById(dbs, { id: service.databaseId });

      deps.push({
        why: key,
        refId: db.id,
        name: db.handle,
        type: "database",
        resource: db,
      });
    }
  });

  return deps;
}

// export interface DepGraphDb extends DeployDatabase {
//   why: DepNode;
// }

export const selectDependencies = createSelector(
  selectAppConfigByAppId,
  selectApps,
  selectDatabases,
  selectServices,
  selectEndpointsAsList,
  findDeps,
);

export const selectDependenciesByType = createSelector(
  selectDependencies,
  (deps) => {
    const depGroups: { app: AppDependency[]; database: DatabaseDependency[] } =
      {
        app: [],
        database: [],
      };

    deps.forEach((dep) => {
      switch (dep.type) {
        case "app":
          depGroups.app.push(dep);
          break;
        case "database":
          depGroups.database.push(dep);
          break;
      }
    });

    return depGroups;
  },
);

// export interface DepGraphApp extends DeployApp {
//   why: DepNode;
// }

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id");

export const appConfigEntities = {
  configuration: defaultEntity({
    id: "configuration",
    deserialize: deserializeAppConfig,
    save: schema.appConfigs.add,
  }),
};
