import { thunks } from "@app/api";
import { db, schema } from "@app/schema";

export const selectRedirectPath = db.redirectPath.select;
export const setRedirectPath = thunks.create<string>(
  "set-redirect-path",
  function* (ctx, next) {
    yield* schema.update(db.redirectPath.set(ctx.payload));
    yield* next();
  },
);
export const resetRedirectPath = thunks.create(
  "reset-redirect-path",
  function* (_, next) {
    yield* schema.update(db.redirectPath.reset());
    yield* next();
  },
);
