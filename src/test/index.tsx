import { prepareStore } from "@app/fx";
import { Store, configureStore } from "@reduxjs/toolkit";
import { act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouteObject, RouterProvider, createMemoryRouter } from "react-router";
import { REHYDRATE } from "redux-persist";

import {
  appRoutes,
  persistConfig,
  reducers,
  rootEntities,
  sagas,
} from "@app/app";
import { bootup } from "@app/bootup";
import { hasDeployEnvironment, selectEnvironmentById } from "@app/deploy";
import { selectBootupLoaded } from "@app/initial-data";
import { testEnv } from "@app/mocks";
import { resetReducer } from "@app/reset-store";
import type { AppState } from "@app/types";

export const setupTestStore = (
  initState: Partial<AppState> = {},
): { store: Store<AppState> } => {
  const middleware = [];
  const prepared = prepareStore({
    reducers: reducers,
    sagas: sagas,
  });

  middleware.push(...prepared.middleware);
  const baseReducer = resetReducer(prepared.reducer, persistConfig);

  const store = configureStore({
    preloadedState: { ...initState, entities: rootEntities },
    reducer: baseReducer,
    devTools: false,
    middleware: middleware,
  });

  prepared.run();

  return { store: store as any };
};

/**
 * This function helps simulate booting the entire app as if it were
 * the browser.  All of redux, redux-saga, and redux-persist are loaded
 * and configured.
 *
 * We also dispatch the `bootup()` saga which fetches a bunch of data.
 */
export const setupAppIntegrationTest = (
  {
    routes = appRoutes,
    initState = {},
    initEntries = [],
  }: Partial<{
    routes: RouteObject[];
    initState: Partial<AppState>;
    initEntries: string[];
  }> = {
    routes: appRoutes,
    initState: {},
    initEntries: [],
  },
) => {
  const router = createMemoryRouter(routes, { initialEntries: initEntries });
  const { store } = setupTestStore({
    ...initState,
    env: {
      ...testEnv,
      ...initState.env,
    },
  });
  store.dispatch(bootup());
  store.dispatch({ type: REHYDRATE });
  const App = () => {
    return (
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  };
  return { store, router, App };
};

export const setupIntegrationTest = (
  {
    path = "/",
    initState = {},
    initEntries = ["/"],
    additionalRoutes = [],
  }: {
    path?: string;
    initState?: Partial<AppState>;
    initEntries?: string[];
    additionalRoutes?: RouteObject[];
  } = { path: "/", initState: {}, initEntries: ["/"], additionalRoutes: [] },
) => {
  const { store } = setupTestStore({
    ...initState,
    env: {
      ...testEnv,
      ...initState.env,
    },
  });
  store.dispatch(bootup());
  store.dispatch({ type: REHYDRATE });

  const TestProvider = ({ children }: { children: React.ReactNode }) => {
    const router = createMemoryRouter(
      [
        {
          path,
          element: children,
        },
        ...additionalRoutes,
      ],
      { initialEntries: initEntries, initialIndex: 0 },
    );
    return (
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  };
  return { store, TestProvider };
};

export const waitForData = (
  store: Store<AppState>,
  predicate: (s: AppState) => boolean,
  msg = "",
) =>
  waitFor(() => {
    if (!predicate(store.getState())) {
      throw new Error(`no data found${msg ? ` (${msg})` : ""}`);
    }
  });

export const waitForBootup = (store: Store<AppState>) =>
  waitForData(store, (state) => 
    selectBootupLoaded(state, {
      ids: [
        "fetch-all-stacks",
        "fetch-all-envs",
        "fetch-all-apps",
        "fetch-all-databases",
        "fetch-all-log-drains",
        "fetch-all-metric-drains",
        "fetch-all-services",
        "fetch-all-endpoints",
      ],
    })
  );

export const waitForToken = (store: Store<AppState>) =>
  waitForData(store, (state) => state.token.accessToken !== "");

// we need to wait for accounts so we can do permission checks
export const waitForEnv = (store: Store<AppState>, envId: string | number) =>
  waitForData(store, (state) => {
    return hasDeployEnvironment(
      selectEnvironmentById(state, { id: `${envId}` }),
    );
  });

export const sleep = (n: number) =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, n);
      }),
  );
