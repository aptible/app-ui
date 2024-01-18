import { resetToken } from "@app/api";
import { createAction, select, take } from "@app/fx";
import { WebState, schema } from "@app/schema";
import { PERSIST_LOADER_ID, StoreContext } from "starfx/store";

export const resetStore = createAction("RESET_STORE");

function* watchResetStore() {
  while (true) {
    yield* take([`${resetToken}`, `${resetStore}`]);
    const store = yield* StoreContext;
    const keep: (keyof WebState)[] = [
      "redirectPath",
      "entities",
      "signal",
      "env",
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
