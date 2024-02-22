import { schema } from "@app/schema";
import { createSelector } from "starfx/store";

export const selectIsAnyLoading = createSelector(
  schema.loaders.selectTableAsList,
  (loaders) => {
    for (let i = 0; i < loaders.length; i += 1) {
      if (loaders[i].status === "loading") {
        return true;
      }
    }
    return false;
  },
);
