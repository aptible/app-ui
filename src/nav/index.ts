import { thunks } from "@app/api";
import { schema } from "@app/schema";

export const selectNav = schema.nav.select;
export const setCollapsed = thunks.create<{ collapsed: boolean }>(
  "nav-collapse",
  function* (ctx, next) {
    yield* schema.update(schema.nav.set(ctx.payload));
    yield* next();
  },
);
