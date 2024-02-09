import { appRoutes } from "@app/app";
import { setupTestStore } from "@app/app";
import { bootup } from "@app/bootup";
import { hasDeployEnvironment } from "@app/deploy";
import { FxStore } from "@app/fx";
import { testEnv } from "@app/mocks";
import { Provider } from "@app/react";
import { WebState, schema } from "@app/schema";
import { waitFor } from "@testing-library/react";
import { RouteObject, RouterProvider, createMemoryRouter } from "react-router";

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
    initState: Partial<WebState>;
    initEntries: string[];
  }> = {
    routes: appRoutes,
    initState: {},
    initEntries: [],
  },
) => {
  const router = createMemoryRouter(routes, { initialEntries: initEntries });
  const store = setupTestStore({
    ...initState,
    env: {
      ...testEnv,
      ...initState.env,
    },
  });
  store.run(bootup.run());
  const App = () => {
    return (
      <Provider schema={schema} store={store}>
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
    initState?: Partial<WebState>;
    initEntries?: string[];
    additionalRoutes?: RouteObject[];
  } = { path: "/", initState: {}, initEntries: ["/"], additionalRoutes: [] },
) => {
  const store = setupTestStore({
    ...initState,
    env: {
      ...testEnv,
      ...initState.env,
    },
  });
  store.run(bootup.run());

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
      <Provider schema={schema} store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  };
  return { store, TestProvider };
};

export const waitForData = (
  store: FxStore<WebState>,
  predicate: (s: WebState) => boolean,
  msg = "",
) =>
  waitFor(() => {
    if (!predicate(store.getState())) {
      throw new Error(`no data found${msg ? ` (${msg})` : ""}`);
    }
  });

export const waitForBootup = (store: FxStore<WebState>) =>
  waitForData(
    store,
    (state) => schema.loaders.selectById(state, { id: `${bootup}` }).isSuccess,
  );

export const waitForToken = (store: FxStore<WebState>) =>
  waitForData(store, (state) => state.token.accessToken !== "");

// we need to wait for accounts so we can do permission checks
export const waitForEnv = (store: FxStore<WebState>, envId: string | number) =>
  waitForData(store, (state) => {
    return hasDeployEnvironment(
      schema.environments.selectById(state, { id: `${envId}` }),
    );
  });

export const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
