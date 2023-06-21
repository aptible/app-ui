import { configureStore } from "@reduxjs/toolkit";
import type { Middleware, Store } from "@reduxjs/toolkit";
import debug from "debug";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { BATCH, prepareStore } from "saga-query";

import { REDIRECT_NAME } from "@app/redirect-path";
import { resetReducer } from "@app/reset-store";
import { THEME_NAME } from "@app/theme";
import { ELEVATED_TOKEN_NAME, TOKEN_NAME } from "@app/token";
import type { AppState } from "@app/types";

import { reducers, sagas } from "./packages";
import { sentryErrorReporter } from "./sentry";
import { FEEDBACK_NAME } from "@app/feedback";
import { NAV_NAME } from "@app/nav";

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
    TOKEN_NAME,
    ELEVATED_TOKEN_NAME,
    THEME_NAME,
    NAV_NAME,
    REDIRECT_NAME,
    FEEDBACK_NAME,
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
      log("NEXT STATE", store.getState());
    };
    middleware.push(logger);
  }

  middleware.push(sentryErrorReporter);
  const prepared = prepareStore({
    reducers,
    sagas,
  });

  middleware.push(...prepared.middleware);

  // we need this baseReducer so we can wipe the localStorage cache as well as
  // reset the store when a user logs out
  const baseReducer = resetReducer(prepared.reducer, persistConfig);
  const persistedReducer = persistReducer(persistConfig, baseReducer);

  const store = configureStore({
    preloadedState: initState,
    reducer: persistedReducer,
    devTools: import.meta.env.DEV,
    middleware: middleware,
  });
  const persistor = persistStore(store);

  prepared.run();

  return { store, persistor };
}
