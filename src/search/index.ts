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
  RecentResourceItem,
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
  selectResourcesAsList,
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
      } else if (resource.type === "environment") {
        handleMatch = resource.data?.handle.includes(searchLower) || false;
      } else if (resource.type === "app") {
        handleMatch = resource.data?.handle.includes(searchLower) || false;
      } else if (resource.type === "database") {
        handleMatch = resource.data?.handle.includes(searchLower) || false;
      }

      const idMatch = resource.id.includes(searchLower);
      const typeMatch = resource.type.includes(searchLower);

      return handleMatch || idMatch || typeMatch;
    });
  },
);

export const RECENT_RESOURCES_NAME = "recentResources";
export const slice = createTable<RecentResourceItem>({
  name: RECENT_RESOURCES_NAME,
});
export const { add: addRecentResources, patch: patchRecentResources } =
  slice.actions;
const selectors = slice.getSelectors((s: AppState) => s.recentResources);
const {
  selectTableAsList: selectRecentResourcesAsList,
  selectById: selectRecentResourceById,
} = selectors;
export const reducers = createReducerMap(slice);

export const selectRecentResourcesByPopularity = createSelector(
  selectRecentResourcesAsList,
  (resources) => {
    return resources.sort((a, b) => {
      const dateB = new Date(b.lastAccessed).getTime();
      const dateA = new Date(a.lastAccessed).getTime();
      if (dateB === dateA) {
        return b.count - a.count;
      }

      return dateB - dateA;
    });
  },
);

export const setRecentResource = thunks.create<
  Pick<RecentResourceItem, "id" | "type">
>("add-recent-resource", function* (ctx, next) {
  const recentResource = yield* select(selectRecentResourceById, {
    id: ctx.payload.id,
  });
  const now = new Date().toISOString();
  if (!recentResource) {
    yield* put(
      addRecentResources({
        [ctx.payload.id]: { ...ctx.payload, count: 1, lastAccessed: now },
      }),
    );
  } else {
    yield* put(
      patchRecentResources({
        [ctx.payload.id]: {
          count: recentResource.count + 1,
          lastAccessed: now,
        },
      }),
    );
  }
  yield* next();
});
