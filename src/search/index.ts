import { thunks } from "@app/api";
import {
  getEndpointUrl,
  selectAppsByOrgAsList,
  selectCustomResourcesByOrgAsList,
  selectDatabasesByOrgAsList,
  selectEndpointsByOrgAsList,
  selectEnvironmentsByOrgAsList,
  selectStacksByOrgAsList,
} from "@app/deploy";
import { createSelector, select } from "@app/fx";
import { type WebState, schema } from "@app/schema";
import type {
  AbstractResourceItem,
  DeployApp,
  DeployCustomResource,
  DeployDatabase,
  DeployEndpoint,
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

export interface EndpointItem extends AbstractResourceItem {
  type: "endpoint";
  data?: DeployEndpoint;
}

export interface CustomResourceItem extends AbstractResourceItem {
  type: "custom_resource";
  data?: DeployCustomResource;
}

export type ResourceItem =
  | StackItem
  | EnvItem
  | AppItem
  | DbItem
  | EndpointItem
  | CustomResourceItem;

export const selectAllResourcesAsList = createSelector(
  selectStacksByOrgAsList,
  selectEnvironmentsByOrgAsList,
  selectAppsByOrgAsList,
  selectDatabasesByOrgAsList,
  selectEndpointsByOrgAsList,
  selectCustomResourcesByOrgAsList,
  (stacks, envs, apps, dbs, enps, crs): ResourceItem[] => {
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

    dbs.forEach((dbi) => {
      resources.push({
        type: "database",
        id: dbi.id,
        data: dbi,
      });
    });

    enps.forEach((enp) => {
      resources.push({
        type: "endpoint",
        id: enp.id,
        data: enp,
      });
    });

    crs.forEach((cr) => {
      resources.push({
        type: "custom_resource",
        id: cr.id,
        data: cr,
      });
    });

    return resources;
  },
);

export const selectResourcesForSearch = createSelector(
  selectAllResourcesAsList,
  (_: WebState, p: { search: string }) => p.search,
  (resources, search) => {
    const searchLower = search.toLocaleLowerCase();
    if (search === "") {
      return [];
    }

    return resources.filter((resource) => {
      let handleMatch = false;
      if (resource.type === "stack") {
        handleMatch = resource.data?.name.includes(searchLower) || false;
      } else if (resource.type === "endpoint") {
        const url = getEndpointUrl(resource.data);
        handleMatch = url ? url.includes(searchLower) : false;
      } else if (resource.type === "custom_resource") {
        handleMatch =
          resource.data?.handle.toLocaleLowerCase().includes(searchLower) ||
          resource.data?.resourceType
            .toLocaleLowerCase()
            .includes(searchLower) ||
          false;
      } else {
        handleMatch = resource.data?.handle.includes(searchLower) || false;
      }

      const idMatch = resource.id === searchLower;
      const typeMatch = resource.type === searchLower;

      return handleMatch || idMatch || typeMatch;
    });
  },
);

export const selectResourceStatsAsList = schema.resourceStats.selectTableAsList;
export const selectResourceStatsById = schema.resourceStats.selectById;

export const selectResourcesByLastAccessed = createSelector(
  selectResourceStatsAsList,
  (resourceStats) => {
    return [...resourceStats].sort((a, b) => {
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
    return [...resources].sort((a, b) => {
      const dateB = new Date(b.lastAccessed).getTime();
      const dateA = new Date(a.lastAccessed).getTime();
      if (b.count === a.count) {
        return dateB - dateA;
      }

      return b.count - a.count;
    });
  },
);

export const getResourceStatId = (
  resource: Pick<ResourceStats, "id" | "type">,
) => {
  return `${resource.type}-${resource.id}`;
};

export const setResourceStats = thunks.create<
  Pick<ResourceStats, "id" | "type">
>("add-recent-resource", function* (ctx, next) {
  const id = getResourceStatId(ctx.payload);
  const resource = yield* select((s: WebState) =>
    selectResourceStatsById(s, {
      id,
    }),
  );
  const now = new Date().toISOString();
  if (!resource) {
    yield* schema.update(
      schema.resourceStats.add({
        [id]: { ...ctx.payload, count: 1, lastAccessed: now },
      }),
    );
  } else {
    yield* schema.update(
      schema.resourceStats.patch({
        [id]: {
          count: resource.count + 1,
          lastAccessed: now,
        },
      }),
    );
  }
  yield* next();
});
