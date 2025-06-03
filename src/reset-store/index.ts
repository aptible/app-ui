import { resetToken } from "@app/api";
import {
  PERSIST_LOADER_ID,
  StoreContext,
  createAction,
  select,
  take,
} from "@app/fx";
import { type WebState, schema } from "@app/schema";

export const resetStore = createAction("RESET_STORE");

function* watchResetStore() {
  while (true) {
    yield* take([`${resetToken}`, `${resetStore}`]);
    const store = yield* StoreContext.expect();
    const keep: (keyof WebState)[] = [
      "redirectPath",
      "entities",
      "signal",
      "env",
      "notices",
    ];
    yield* store.reset(keep);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
  }
}

function* watchSignal() {
  while (true) {
    yield* take(`${resetStore}`);
    const signal = yield* select(schema.signal.select);
    signal.abort("reset store");
    yield* schema.update(schema.signal.set(new AbortController()));
  }
}

export const sagas = { watchResetStore, watchSignal };
