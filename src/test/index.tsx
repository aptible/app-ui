import { Provider } from "react-redux";
import { RouteObject, RouterProvider, createMemoryRouter } from "react-router";
import { prepareStore } from "saga-query";

import { reducers, rootEntities, sagas } from "@app/app";
import { ftuxRoutes } from "@app/app/router";
import { bootup } from "@app/bootup";
import { testEnv } from "@app/mocks";
import type { AppState } from "@app/types";
import { Store, configureStore } from "@reduxjs/toolkit";
import { waitFor } from "@testing-library/react";
import { REHYDRATE } from "redux-persist";

export const setupTestStore = (
  initState: Partial<AppState> = {},
): { store: Store<AppState> } => {
  const middleware = [];
  const prepared = prepareStore({
    reducers: reducers,
    sagas: sagas,
  });

  middleware.push(...prepared.middleware);

  const store = configureStore({
    preloadedState: { ...initState, entities: rootEntities },
    reducer: prepared.reducer,
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
 * We also dispatch the `booup()` saga which fetches a bunch of data.
 */
export const setupAppIntegrationTest = (
  {
    routes = ftuxRoutes,
    initState = {},
    initEntries = [],
  }: Partial<{
    routes: RouteObject[];
    initState: Partial<AppState>;
    initEntries: string[];
  }> = {
    routes: ftuxRoutes,
    initState: {},
    initEntries: [],
  },
) => {
  const router = createMemoryRouter(routes, { initialEntries: initEntries });
  const { store } = setupTestStore({
    ...initState,
    env: testEnv,
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
    env: testEnv,
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

export const waitForToken = (store: Store<AppState>) => {
  return waitFor(() => {
    if (store.getState().token.accessToken === "") {
      throw new Error("no token");
    }
  });
};
