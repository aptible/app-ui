import {
  selectAppsAsList,
  selectDatabasesAsList,
  selectEnvironmentsAsList,
  selectStacksAsList,
} from "@app/deploy";
import {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployEnvironment,
  DeployStack,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

interface AbstractResourceItem {
  id: string;
  handle: string;
}

export interface StackItem extends AbstractResourceItem {
  type: "stack";
  data: DeployStack;
}

export interface EnvItem extends AbstractResourceItem {
  type: "environment";
  data: DeployEnvironment;
}

export interface AppItem extends AbstractResourceItem {
  type: "app";
  data: DeployApp;
}

export interface DbItem extends AbstractResourceItem {
  type: "database";
  data: DeployDatabase;
}

export type ResourceItem = StackItem | EnvItem | AppItem | DbItem;

export const selectResourcesAsList = createSelector(
  selectStacksAsList,
  selectEnvironmentsAsList,
  selectAppsAsList,
  selectDatabasesAsList,
  (stacks, envs, apps, dbs): ResourceItem[] => {
    const resources: ResourceItem[] = [];
    stacks.forEach((stack) => {
      resources.push({
        type: "stack",
        id: stack.id,
        handle: stack.name.toLocaleLowerCase(),
        data: stack,
      });
    });

    envs.forEach((env) => {
      resources.push({
        type: "environment",
        id: env.id,
        handle: env.handle.toLocaleLowerCase(),
        data: env,
      });
    });

    apps.forEach((app) => {
      resources.push({
        type: "app",
        id: app.id,
        handle: app.handle.toLocaleLowerCase(),
        data: app,
      });
    });

    dbs.forEach((db) => {
      resources.push({
        type: "database",
        id: db.id,
        handle: db.handle.toLocaleLowerCase(),
        data: db,
      });
    });

    return resources;
  },
);

export const selectResourcesForSearch = createSelector(
  selectResourcesAsList,
  (_: AppState, p: { search: string }) => p.search,
  (resources, search) => {
    const searchLower = search.toLocaleLowerCase();
    if (search === "") {
      return [];
    }

    return resources.filter((resource) => {
      const handleMatch = resource.handle.includes(searchLower);
      const idMatch = resource.id.includes(searchLower);
      const typeMatch = resource.type.includes(searchLower);

      return handleMatch || idMatch || typeMatch;
    });
  },
);
