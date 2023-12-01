import { thunks } from "@app/api";
import { db, schema } from "@app/schema";

export const selectNav = db.nav.select;
export const setCollapsed = thunks.create<{ collapsed: boolean }>(
  "nav-collapse",
  function* (ctx, next) {
    yield* schema.update(db.nav.set(ctx.payload));
    yield* next();
  },
);
