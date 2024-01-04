import { authApi, thunks } from "@app/api";
import { parallel, put, select } from "@app/fx";
import { resetStore } from "@app/reset-store";
import { db, schema } from "@app/schema";
import { selectToken } from "@app/token";

export const deleteToken = authApi.delete<{ id: string }>("/tokens/:id");

export const logout = thunks.create("logout", function* (ctx, next) {
  yield* schema.update(db.loaders.start({ id: ctx.name }));
  const token = yield* select(selectToken);
  const elevatedToken = yield* select(db.elevatedToken.select);
  const group = yield* parallel([
    () => deleteToken.run(deleteToken({ id: token.tokenId })),
    () => deleteToken.run(deleteToken({ id: elevatedToken.tokenId })),
  ]);
  yield* group;
  yield* next();

  yield* put(resetStore());
  yield* schema.update([
    db.elevatedToken.reset(),
    db.loaders.success({ id: ctx.name }),
  ]);
});
