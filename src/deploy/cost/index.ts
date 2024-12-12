import { api, cacheLongTimer } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type { DeployCost, DeployCostRates } from "@app/types";

export * from "./calc";

interface CostResponse {
  id: number;
  est_cost: number;
  resource_type: string;
  _type: "cost";
}

type CostResourceType = "Stack" | "Account" | "App" | "Database" | "Service";

// we need to create an ID in the UI that is different from what the API
// returns because the cost endpoints will returns ids for separate tables
// (e.g. stacks, accounts, apps, dbs, ...) which can have overlapping ids.
export function computeCostId(
  resourceType: CostResourceType,
  id: string,
): string {
  return `${resourceType}-${id}`;
}

function deserializeCost(c: CostResponse): DeployCost {
  return {
    id: computeCostId(c.resource_type as any, `${c.id}`),
    estCost: c.est_cost,
    resourceType: c.resource_type,
  };
}

interface OrgIdProp {
  orgId: string;
}

export const fetchCostsByStacks = api.get<OrgIdProp>("/costs/:orgId/stacks", {
  supervisor: cacheLongTimer(),
});

export const fetchCostsByEnvironments = api.get<OrgIdProp>(
  "/costs/:orgId/accounts",
  {
    supervisor: cacheLongTimer(),
  },
);

export const fetchCostsByApps = api.get<OrgIdProp>("/costs/:orgId/apps", {
  supervisor: cacheLongTimer(),
});

export const fetchCostsByDatabases = api.get<OrgIdProp>(
  "/costs/:orgId/databases",
  {
    supervisor: cacheLongTimer(),
  },
);

export const fetchCostsByServices = api.get<OrgIdProp>(
  "/costs/:orgId/services",
  {
    supervisor: cacheLongTimer(),
  },
);

export const fetchCostRates = api.get<OrgIdProp, DeployCostRates>(
  "/costs/:orgId/rates",
  {
    supervisor: cacheLongTimer(),
  },
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.costRates.set(ctx.json.value));
  },
);

export const costEntities = {
  cost: defaultEntity({
    id: "cost",
    deserialize: deserializeCost,
    save: schema.costs.add,
  }),
};

export const formatCurrency = (num?: number) =>
  (num || 0.0).toLocaleString("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
