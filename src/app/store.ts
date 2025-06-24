import { bootup } from "@app/bootup";
import { createLog } from "@app/debug";
import {
  type Callable,
  type Operation,
  PERSIST_LOADER_ID,
  createBatchMdw,
  createLocalStorageAdapter,
  createPersistor,
  parallel,
  persistStoreMdw,
  take,
} from "@app/fx";
import {
  type WebState,
  schema,
  initialState as schemaInitialState,
} from "@app/schema";
import { createStore } from "starfx";
import { rootEntities, tasks } from "./packages";

const log = createLog("fx");

export function setupStore({
  logs = true,
  initialState = {},
}: { logs?: boolean; initialState?: Partial<WebState> }) {
  const persistor = createPersistor<WebState>({
    adapter: createLocalStorageAdapter(),
    allowlist: [
      "theme",
      "nav",
      "redirectPath",
      "feedback",
      "resourceStats",
      "notices",
      "pinnedResources",
    ],
  });

  const store = createStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask), persistStoreMdw(persistor)],
  });

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    tsks.push(function* logActions(): Operation<void> {
      while (true) {
        const action = yield* take("*");
        if (action.type === "store") {
          continue;
        }
        log(action);
      }
    });
  }
  tsks.push(...tasks);

  store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    const group = yield* parallel(tsks);
    yield* bootup.run();
    yield* group;
  });

  return store;
}

// persistor makes things more complicated for our tests so we are deliberately
// choosing to not include it for testing.
export function setupTestStore(initialState: Partial<WebState>) {
  const store = createStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask)],
  });

  store.run(function* (): Operation<void> {
    const group = yield* parallel(tasks);
    yield* group;
  });

  return store;
}
