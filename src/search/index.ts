import { createSelector } from "@reduxjs/toolkit";
import { put, select } from "saga-query";

import { thunks } from "@app/api";
import {
  selectAppsAsList,
  selectDatabasesAsList,
  selectEnvironmentsAsList,
  selectStacksAsList,
} from "@app/deploy";
import { createReducerMap, createTable } from "@app/slice-helpers";
import {
  AbstractResourceItem,
  AppState,
  DeployApp,
  DeployDatabase,
  DeployEnvironment,
  DeployStack,
  ResourceStats,
} from "@app/types";

export interface StackItem extends AbstractResourceItem {
  type: "stack";
  data?: DeployStack;
}

export interface EnvItem extends AbstractResourceItem {
  type: "environment";
  data?: DeployEnvironment;
}

export interface AppItem extends AbstractResourceItem {
  type: "app";
  data?: DeployApp;
}

export interface DbItem extends AbstractResourceItem {
  type: "database";
  data?: DeployDatabase;
}

export type ResourceItem = StackItem | EnvItem | AppItem | DbItem;

export const selectAllResourcesAsList = createSelector(
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
        data: stack,
      });
    });

    envs.forEach((env) => {
      resources.push({
        type: "environment",
        id: env.id,
        data: env,
      });
    });

    apps.forEach((app) => {
      resources.push({
        type: "app",
        id: app.id,
        data: app,
      });
    });

    dbs.forEach((db) => {
      resources.push({
        type: "database",
        id: db.id,
        data: db,
      });
    });

    return resources;
  },
);

export const selectResourcesForSearch = createSelector(
  selectAllResourcesAsList,
  (_: AppState, p: { search: string }) => p.search,
  (resources, search) => {
    const searchLower = search.toLocaleLowerCase();
    if (search === "") {
      return [];
    }

    return resources.filter((resource) => {
      let handleMatch = false;
      if (resource.type === "stack") {
        handleMatch = resource.data?.name.includes(searchLower) || false;
      } else {
        handleMatch = resource.data?.handle.includes(searchLower) || false;
      }

      const idMatch = resource.id.includes(searchLower);
      const typeMatch = resource.type.includes(searchLower);

      return handleMatch || idMatch || typeMatch;
    });
  },
);

export const RESOURCE_STATS_NAME = "resourceStats";
export const slice = createTable<ResourceStats>({
  name: RESOURCE_STATS_NAME,
});
export const { add: addResourceStats, patch: patchResourceStats } =
  slice.actions;
const selectors = slice.getSelectors((s: AppState) => s.resourceStats);
const {
  selectTableAsList: selectResourceStatsAsList,
  selectById: selectResourceStatsById,
} = selectors;
export const reducers = createReducerMap(slice);

export const selectResourcesByLastAccessed = createSelector(
  selectResourceStatsAsList,
  (resourceStats) => {
    return resourceStats.sort((a, b) => {
      const dateB = new Date(b.lastAccessed).getTime();
      const dateA = new Date(a.lastAccessed).getTime();
      if (dateB === dateA) {
        return b.count - a.count;
      }

      return dateB - dateA;
    });
  },
);

export const selectResourcesByMostVisited = createSelector(
  selectResourceStatsAsList,
  (resources) => {
    return resources.sort((a, b) => {
      const dateB = new Date(b.lastAccessed).getTime();
      const dateA = new Date(a.lastAccessed).getTime();
      if (b.count === a.count) {
        return dateB - dateA;
      }

      return b.count - a.count;
    });
  },
);

const getResourceStatId = (resource: Pick<ResourceStats, "id" | "type">) => {
  return `${resource.type}-${resource.id}`;
};

export const setResourceStats = thunks.create<
  Pick<ResourceStats, "id" | "type">
>("add-recent-resource", function* (ctx, next) {
  const id = getResourceStatId(ctx.payload);
  const resource = yield* select(selectResourceStatsById, {
    id,
  });
  const now = new Date().toISOString();
  if (!resource) {
    yield* put(
      addResourceStats({
        [id]: { ...ctx.payload, count: 1, lastAccessed: now },
      }),
    );
  } else {
    yield* put(
      patchResourceStats({
        [id]: {
          count: resource.count + 1,
          lastAccessed: now,
        },
      }),
    );
  }
  yield* next();
});
