import {
  computeCostId,
  getStackType,
  selectStacksByOrgAsList,
} from "@app/deploy";
import { createSelector } from "@app/fx";
import { type WebState, schema } from "@app/schema";
import type { DeployStack } from "@app/types";

export interface DeployStackRow extends DeployStack {
  cost: number;
}

export const selectStacksForTableSearch = createSelector(
  selectStacksByOrgAsList,
  (_: WebState, p: { search: string }) => p.search,
  schema.costs.selectTable,
  (stacks, search, costs): DeployStackRow[] => {
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

    return results
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((stack) => {
        const costItem = schema.costs.findById(costs, {
          id: computeCostId("Stack", stack.id),
        });
        const cost = costItem.estCost;
        return { ...stack, cost };
      });
  },
);
