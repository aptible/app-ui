import { thunks } from "@app/api";
import { schema } from "@app/schema";

export const selectRedirectPath = schema.redirectPath.select;
export const setRedirectPath = thunks.create<string>(
  "set-redirect-path",
  function* (ctx, next) {
    yield* schema.update(schema.redirectPath.set(ctx.payload));
    yield* next();
  },
);
export const resetRedirectPath = thunks.create(
  "reset-redirect-path",
  function* (_, next) {
    yield* schema.update(schema.redirectPath.reset());
    yield* next();
  },
);
