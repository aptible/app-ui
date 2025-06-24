import { thunks } from "@app/api";
import { type WebState, schema } from "@app/schema";
import type { PinnedResource } from "@app/types";
import { createSelector, put, select } from "starfx";

export const addPinnedResource = thunks.create<PinnedResource>(
  "add-pinned-resources",
  function* (ctx, next) {
    yield* next();
    const resources = yield* select((s: WebState) =>
      schema.pinnedResources.selectById(s, { id: ctx.payload.orgId }),
    );
    const res = [...(resources || [])];
    res.push(ctx.payload);
    yield* schema.update(
      schema.pinnedResources.add({ [ctx.payload.orgId]: res }),
    );
  },
);

export const removePinnedResource = thunks.create<PinnedResource>(
  "remove-pinned-resources",
  function* (ctx, next) {
    yield* next();
    const resources = yield* select((s: WebState) =>
      schema.pinnedResources.selectById(s, { id: ctx.payload.orgId }),
    );
    if (!resources) {
      return;
    }
    const found = resources.findIndex(
      (s) => s.id === ctx.payload.id && s.type === ctx.payload.type,
    );
    if (found === -1) {
      return;
    }

    const res = [...resources];
    res.splice(found, 1);
    yield* schema.update(
      schema.pinnedResources.set({ [ctx.payload.orgId]: res }),
    );
  },
);

export const togglePinnedResource = thunks.create<PinnedResource>(
  "toggle-pinned-resource",
  function* (ctx, next) {
    yield* next();
    const resources = yield* select((s: WebState) =>
      schema.pinnedResources.selectById(s, { id: ctx.payload.orgId }),
    );

    if (!resources) {
      yield* put(addPinnedResource(ctx.payload));
      return;
    }

    const found = resources.findIndex(
      (s) => s.id === ctx.payload.id && s.type === ctx.payload.type,
    );
    if (found === -1) {
      yield* put(addPinnedResource(ctx.payload));
      return;
    }

    yield* put(removePinnedResource(ctx.payload));
  },
);

export const selectIsPinned = createSelector(
  schema.pinnedResources.selectTable,
  (_: WebState, p: PinnedResource) => p,
  (pr, resource) => {
    const resources = pr[resource.orgId];
    if (!resources) return false;
    const found = resources.findIndex(
      (s) => s.id === resource.id && s.type === resource.type,
    );
    return found >= 0;
  },
);
