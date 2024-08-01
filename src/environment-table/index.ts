import {
  calculateCost,
  findDisksByEnvId,
  findEndpointsByEnvId,
  findServicesByEnvId,
  findStackById,
  selectDisksAsList,
  selectEndpointsAsList,
  selectEnvironmentsByOrgAsList,
  selectServices,
  selectServicesAsList,
  selectStacks,
} from "@app/deploy";
import { createSelector } from "@app/fx";
import type { WebState } from "@app/schema";
import type { DeployEnvironment } from "@app/types";

const computeSearchMatch = (
  env: DeployEnvironment,
  search: string,
): boolean => {
  const handleMatch = env.handle.toLocaleLowerCase().includes(search);
  const idMatch = env.id === search;
  return handleMatch || idMatch;
};

const createEnvSortFn = (
  sortBy: keyof DeployEnvironmentRow,
  sortDir: "asc" | "desc",
) => {
  return (a: DeployEnvironmentRow, b: DeployEnvironmentRow) => {
    if (sortBy === "handle") {
      if (sortDir === "asc") {
        return a.handle.localeCompare(b.handle);
      }
      return b.handle.localeCompare(a.handle);
    }

    if (sortBy === "stackName") {
      if (sortDir === "asc") {
        return a.stackName.localeCompare(b.stackName);
      }
      return b.stackName.localeCompare(a.stackName);
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    }

    if (sortBy === "totalAppCount") {
      if (sortDir === "asc") {
        return a.totalAppCount - b.totalAppCount;
      }
      return b.totalAppCount - a.totalAppCount;
    }

    if (sortBy === "totalDatabaseCount") {
      if (sortDir === "asc") {
        return a.totalDatabaseCount - b.totalDatabaseCount;
      }
      return b.totalDatabaseCount - a.totalDatabaseCount;
    }

    if (sortBy === "cost") {
      if (sortDir === "asc") {
        return a.cost - b.cost;
      }
      return b.cost - a.cost;
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
};

export interface DeployEnvironmentRow extends DeployEnvironment {
  stackName: string;
  cost: number;
}

export const selectEnvironmentsForTable = createSelector(
  selectEnvironmentsByOrgAsList,
  selectStacks,
  selectServicesAsList,
  selectServices,
  selectDisksAsList,
  selectEndpointsAsList,
  (
    envs,
    stacks,
    services,
    serviceMap,
    disks,
    endpoints,
  ): DeployEnvironmentRow[] =>
    envs.map((env) => {
      const stack = findStackById(stacks, { id: env.stackId });
      const cost = calculateCost({
        services: findServicesByEnvId(services, env.id),
        disks: findDisksByEnvId(disks, env.id),
        endpoints: findEndpointsByEnvId(endpoints, serviceMap, env.id),
      }).monthlyCost;
      return { ...env, stackName: stack.name, cost };
    }),
);

export const selectEnvironmentsForTableSearch = createSelector(
  selectEnvironmentsForTable,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, props: { stackId?: string }) => props.stackId || "",
  (_: WebState, p: { sortBy: keyof DeployEnvironmentRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (envs, search, stackId, sortBy, sortDir): DeployEnvironmentRow[] => {
    const sortFn = createEnvSortFn(sortBy, sortDir);

    if (search === "" && stackId === "") {
      return [...envs].sort(sortFn);
    }

    const results = envs.filter((env) => {
      const searchMatch = computeSearchMatch(env, search);
      const stackIdMatch = stackId !== "" && env.stackId === stackId;
      if (stackId !== "") {
        if (search !== "") {
          return stackIdMatch && searchMatch;
        }
        return stackIdMatch;
      }
      return searchMatch;
    });

    return results.sort(sortFn);
  },
);
