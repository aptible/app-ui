import { compose, configureStore } from "@reduxjs/toolkit";
import type { Middleware, Store } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { BATCH, prepareStore } from "saga-query";
import debug from "debug";

import type { AppState } from "@app/types";
import { resetReducer } from "@app/reset-store";
import { TOKEN_NAME, ELEVATED_TOKEN_NAME } from "@app/token";
import { THEME_NAME } from "@app/theme";
import { REDIRECT_NAME } from "@app/redirect-path";

import { sagas, reducers } from "./packages";

interface Props {
  initState?: Partial<AppState>;
}

interface AppStore<State> {
  store: Store<State>;
  persistor: any;
}

const persistConfig = {
  key: "root",
  storage,
  whitelist: [TOKEN_NAME, ELEVATED_TOKEN_NAME, THEME_NAME, REDIRECT_NAME],
};

const log = debug("redux");

export function setupStore({ initState }: Props): AppStore<AppState> {
  const middleware: Middleware[] = [];

  if (import.meta.env.VITE_DEBUG === "true") {
    const logger = (store: any) => (next: any) => (action: any) => {
      if (action.type === BATCH) {
        log("== BATCH ==");
        action.payload.forEach(log);
        log("== END BATCH ==");
      } else {
        log("ACTION", action);
      }
      next(action);
      log("NEXT STATE", store.getState());
    };
    middleware.push(logger);
  }

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
    devTools: process.env.NODE_ENV !== "production",
    middleware: middleware,
  });
  const persistor = persistStore(store);

  prepared.run();

  return { store, persistor };
}
