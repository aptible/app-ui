import { fireEvent, render, screen } from "@testing-library/react";
import { rest } from "msw";
import { useDispatch } from "react-redux";

import { fetchApp } from "@app/deploy";
import { server, testApp, testEnv } from "@app/mocks";
import { setupIntegrationTest, waitForToken } from "@app/test";

import { LogoutPage } from "./logout";
import { LOGIN_PATH, LOGOUT_PATH, logoutUrl } from "@app/routes";

const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });

const TestInFlightLogout = () => {
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(fetchApp({ id: `${testApp.id}` }));
  };
  return (
    <div>
      <button type="button" onClick={onClick}>
        Fetch
      </button>
      <LogoutPage />
    </div>
  );
};

describe("LogoutPage", () => {
  describe("when there is an in-flight request and it eventually completes", () => {
    it("should not store that data in our store", async () => {
      const { TestProvider, store } = setupIntegrationTest({
        initEntries: [LOGOUT_PATH],
        path: logoutUrl(),
        additionalRoutes: [{ path: LOGIN_PATH, element: <div>Login!</div> }],
      });
      server.use(
        rest.get(`${testEnv.apiUrl}/apps/:id`, async (_, res, ctx) => {
          await sleep(200);
          return res(ctx.json(testApp));
        }),
      );
      render(
        <TestProvider>
          <TestInFlightLogout />
        </TestProvider>,
      );
      await waitForToken(store);

      const fetcher = await screen.findByRole("button", { name: "Fetch" });
      const logout = await screen.findByRole("button", { name: /Log Out/ });

      fireEvent.click(fetcher);
      fireEvent.click(logout);

      await screen.findByText(/Login!/);
      await sleep(500);

      expect(store.getState().deploy).toEqual({
        active_plans: {},
        apps: {},
        certificates: {},
        databaseImages: {},
        databases: {},
        endpoints: {},
        environments: {},
        logDrains: {},
        metricDrains: {},
        operations: {},
        permissions: {},
        plans: {},
        serviceDefinitions: {},
        services: {},
        stacks: {},
        releases: {},
        containers: {},
        vpc_peers: {},
        vpn_tunnels: {},
      });
    });
  });
});
