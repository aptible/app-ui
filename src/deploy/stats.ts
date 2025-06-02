import { schema } from "@app/schema";
import { createSelector } from "starfx";
import { selectAppsAsList } from "./app";
import { selectDatabasesAsList } from "./database";
import { selectEnvironments } from "./environment";

export const selectStackStats = createSelector(
  selectEnvironments,
  selectAppsAsList,
  selectDatabasesAsList,
  (envs, apps, dbs) => {
    const mapper: {
      [key: string]: { envCount: number; appCount: number; dbCount: number };
    } = {};

    dbs.forEach((db) => {
      const env = schema.environments.findById(envs, { id: db.environmentId });
      if (!mapper[env.stackId]) {
        mapper[env.stackId] = { envCount: 0, appCount: 0, dbCount: 0 };
      }
      mapper[env.stackId].dbCount += 1;
    });

    apps.forEach((app) => {
      const env = schema.environments.findById(envs, { id: app.environmentId });
      if (!mapper[env.stackId]) {
        mapper[env.stackId] = { envCount: 0, appCount: 0, dbCount: 0 };
      }
      mapper[env.stackId].appCount += 1;
    });

    Object.values(envs).forEach((env) => {
      if (!mapper[env.stackId]) {
        mapper[env.stackId] = { envCount: 0, appCount: 0, dbCount: 0 };
      }
      mapper[env.stackId].envCount += 1;
    });

    return mapper;
  },
);
