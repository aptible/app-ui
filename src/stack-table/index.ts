import {
  computeCostId,
  getStackType,
  selectStacksByOrgAsList,
} from "@app/deploy";
import { selectStackStats } from "@app/deploy/stats";
import { createSelector } from "@app/fx";
import { type WebState, schema } from "@app/schema";
import type { DeployStack } from "@app/types";

export interface DeployStackRow extends DeployStack {
  cost: number;
  envCount: number;
  appCount: number;
  dbCount: number;
}

const createStackSortFn = (
  sortKey: keyof DeployStackRow,
  sortDirection: "asc" | "desc",
) => {
  return (a: DeployStackRow, b: DeployStackRow) => {
    if (sortKey === "name") {
      if (sortDirection === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    }

    if (sortKey === "id") {
      if (sortDirection === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    }

    if (sortKey === "region") {
      if (sortDirection === "asc") {
        return a.region.localeCompare(b.region);
      }
      return b.region.localeCompare(a.region);
    }

    if (sortKey === "cost") {
      if (sortDirection === "asc") {
        return a.cost - b.cost;
      }
      return b.cost - a.cost;
    }

    if (sortKey === "envCount") {
      if (sortDirection === "asc") {
        return a.envCount - b.envCount;
      }
      return b.envCount - a.envCount;
    }

    if (sortKey === "appCount") {
      if (sortDirection === "asc") {
        return a.appCount - b.appCount;
      }
      return b.appCount - a.appCount;
    }

    if (sortKey === "dbCount") {
      if (sortDirection === "asc") {
        return a.dbCount - b.dbCount;
      }
      return b.dbCount - a.dbCount;
    }

    if (sortDirection === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
};

export const selectStacksForTableSearch = createSelector(
  selectStacksByOrgAsList,
  (
    _: WebState,
    p: {
      search: string;
      sortKey: keyof DeployStackRow;
      sortDirection: "asc" | "desc";
    },
  ) => p.search,
  (
    _: WebState,
    p: {
      search: string;
      sortKey: keyof DeployStackRow;
      sortDirection: "asc" | "desc";
    },
  ) => p.sortKey,
  (
    _: WebState,
    p: {
      search: string;
      sortKey: keyof DeployStackRow;
      sortDirection: "asc" | "desc";
    },
  ) => p.sortDirection,
  schema.costs.selectTable,
  selectStackStats,
  (
    stacks,
    search,
    sortKey,
    sortDirection,
    costs,
    statsByStack,
  ): DeployStackRow[] => {
    let results = stacks;
    if (search !== "") {
      const searchLower = search.toLocaleLowerCase();

      results = stacks.filter((stack) => {
        const name = stack.name.toLocaleLowerCase();
        const region = stack.region.toLocaleLowerCase();
        const type = getStackType(stack);

        const nameMatch = name.includes(searchLower);
        const regionMatch = region.includes(searchLower);
        const typeMatch = type.includes(searchLower);
        const idMatch = searchLower === stack.id;

        return nameMatch || regionMatch || typeMatch || idMatch;
      });
    }

    const sortFn = createStackSortFn(sortKey, sortDirection);

    return results
      .map((stack) => {
        const costItem = schema.costs.findById(costs, {
          id: computeCostId("Stack", stack.id),
        });
        const cost = costItem.estCost;
        const stats = statsByStack[stack.id] || {
          envCount: 0,
          appCount: 0,
          dbCount: 0,
        };
        return { ...stack, cost, ...stats };
      })
      .sort(sortFn);
  },
);
