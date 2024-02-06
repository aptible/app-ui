import { bootup } from "@app/bootup";
import {
  PERSIST_LOADER_ID,
  configureStore,
  createBatchMdw,
  createLocalStorageAdapter,
  createPersistor,
  persistStoreMdw,
  take,
} from "@app/fx";
import {
  WebState,
  initialState as schemaInitialState,
  schema,
} from "@app/schema";
import { Callable, LogContext, Operation, each, log, parallel } from "starfx";
import { rootEntities, tasks } from "./packages";

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
      "organizations",
      "stacks",
      "environments",
      "apps",
      "databases",
      "services",
      "endpoints",
    ],
  });

  const store = configureStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask), persistStoreMdw(persistor)],
  });

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    // listen to starfx logger for all log events
    tsks.push(function* logger(): Operation<void> {
      const ctx = yield* LogContext;
      for (const event of yield* each(ctx)) {
        if (event.type.startsWith("error:")) {
          console.error(event.payload);
        } else if (event.type === "action") {
          console.log(event.payload);
        }
        yield* each.next();
      }
    });
    // log all actions dispatched
    tsks.push(function* logActions(): Operation<void> {
      while (true) {
        const action = yield* take("*");
        yield* log({ type: "action", payload: action });
      }
    });
  }
  tsks.push(...tasks, bootup.run());

  store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    const group = yield* parallel(tsks);
    yield* group;
  });

  return store;
}

// persistor makes things more complicated for our tests so we are deliberately
// choosing to not include it for our tests.
export function setupTestStore(initialState: Partial<WebState>) {
  const store = configureStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask)],
  });

  store.run(function* (): Operation<void> {
    const group = yield* parallel([...tasks, bootup.run()]);
    yield* group;
  });

  return store;
}
