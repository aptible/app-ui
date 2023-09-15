import { BATCH, Operation, prepareStore } from "@app/fx";
import { configureStore } from "@reduxjs/toolkit";
import type { Middleware, Store } from "@reduxjs/toolkit";
import debug from "debug";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import { FEEDBACK_NAME } from "@app/feedback";
import { parallel } from "@app/fx";
import { NAV_NAME } from "@app/nav";
import { REDIRECT_NAME } from "@app/redirect-path";
import { resetReducer } from "@app/reset-store";
import { RESOURCE_STATS_NAME } from "@app/search";
import { THEME_NAME } from "@app/theme";
import { ELEVATED_TOKEN_NAME } from "@app/token";
import type { AppState } from "@app/types";

import { reducers, tasks } from "./packages";
import { sentryErrorReporter } from "./sentry";

interface Props {
  initState?: Partial<AppState>;
}

interface AppStore<State> {
  store: Store<State>;
  persistor: any;
}

export const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    ELEVATED_TOKEN_NAME,
    THEME_NAME,
    NAV_NAME,
    REDIRECT_NAME,
    FEEDBACK_NAME,
    RESOURCE_STATS_NAME,
  ],
};

const log = debug("redux");

export function setupStore({ initState }: Props): AppStore<AppState> {
  const middleware: Middleware[] = [];

  if (import.meta.env.VITE_DEBUG === "true") {
    const logger = (_: any) => (next: any) => (action: any) => {
      if (action.type === BATCH) {
        action.payload.forEach((act: any) => log("ACTION", act));
      } else {
        log("ACTION", action);
      }
      next(action);
    };
    middleware.push(logger);
  }

  middleware.push(sentryErrorReporter);
  const { fx, reducer } = prepareStore({
    reducers,
  });

  middleware.push(fx.middleware as any);
  // we need this baseReducer so we can wipe the localStorage cache as well as
  // reset the store when a user logs out
  const baseReducer = resetReducer(reducer, persistConfig);
  const persistedReducer = persistReducer(persistConfig, baseReducer);

  const store = configureStore({
    preloadedState: initState,
    reducer: persistedReducer,
    devTools: import.meta.env.DEV,
    middleware: middleware,
  });
  const persistor = persistStore(store);

  fx.run(function* (): Operation<void> {
    const group = yield* parallel(tasks);
    yield* group;
  });

  return { store, persistor };
}
