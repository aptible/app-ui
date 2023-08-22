import { fireEvent, render, screen } from "@testing-library/react";

import { defaultStackResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testEnv,
  testOrg,
  testOrgSpecial,
  testStack,
  testUserOrgSelected,
  verifiedUserHandlers,
} from "@app/mocks";
import { appsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForData, waitForToken } from "@app/test";
import { rest } from "msw";

describe("Selecting an Organization", () => {
  it("should set the organization to the current user's `selected_organization` property if available", async () => {
    server.use(
      ...verifiedUserHandlers(testUserOrgSelected),
      rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
        return res(
          ctx.json({ _embedded: { organizations: [testOrg, testOrgSpecial] } }),
        );
      }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [appsUrl()],
    });

    render(<App />);

    await waitForToken(store);
    await waitForData(store, (state) => {
      return Object.values(state.organizations).length > 0;
    });

    expect(screen.queryByText(/Wow Org/)).toBeInTheDocument();
  });

  it("should successfully change the selected organization", async () => {
    const testStackSpecial = defaultStackResponse({
      id: createId(),
      name: "Special Stack",
      _links: {
        organization: defaultHalHref(
          `${testEnv.authUrl}/organizations/${testOrgSpecial.id}`,
        ),
      },
    });
    const testStackDontShow = defaultStackResponse({
      id: createId(),
      name: "Dont show this Stack",
      _links: {
        organization: defaultHalHref(
          `${testEnv.authUrl}/organizations/${testOrg.id}`,
        ),
      },
    });

    server.use(
      ...stacksWithResources({
        stacks: [testStack, testStackSpecial, testStackDontShow],
      }),
      ...verifiedUserHandlers(),
      rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
        return res(
          ctx.json({ _embedded: { organizations: [testOrg, testOrgSpecial] } }),
        );
      }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [appsUrl()],
    });

    render(<App />);

    await waitForToken(store);
    await waitForData(store, (state) => {
      return Object.values(state.organizations).length > 0;
    });
    const btn = await screen.findByText(/test-org/);
    fireEvent.click(btn);

    await screen.findByText(/Choose Organization/);
    const next = await screen.findByText(/Wow Org/);
    fireEvent.click(next);

    const stacks = await screen.findByText(/Stacks/);
    fireEvent.click(stacks);

    expect(screen.queryByText(/Wow Org/)).toBeInTheDocument();
    await screen.findByText(/Special Stack/);
    expect(screen.queryByText(/Dont show this Stack/)).not.toBeInTheDocument();
  });

  describe("when user selects organization that requires reauthorization", () => {
    it("should force logout the user", async () => {
      const testStackSpecial = defaultStackResponse({
        id: createId(),
        name: "Special Stack",
        _links: {
          organization: defaultHalHref(
            `${testEnv.authUrl}/organizations/${testOrgSpecial.id}`,
          ),
        },
      });
      const testStackDontShow = defaultStackResponse({
        id: createId(),
        name: "Dont show this Stack",
        _links: {
          organization: defaultHalHref(
            `${testEnv.authUrl}/organizations/${testOrg.id}`,
          ),
        },
      });

      server.use(
        ...stacksWithResources({
          stacks: [testStack, testStackSpecial, testStackDontShow],
        }),
        ...verifiedUserHandlers(),
        rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: { organizations: [testOrg, testOrgSpecial] },
            }),
          );
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [appsUrl()],
      });

      render(<App />);

      await waitForToken(store);
      await waitForData(store, (state) => {
        return Object.values(state.organizations).length > 0;
      });
      const btn = await screen.findByText(/test-org/);
      fireEvent.click(btn);

      await screen.findByText(/Choose Organization/);
      const next = await screen.findByText(/Reauth Org/);
      fireEvent.click(next);

      // should redirect to login page
      await screen.findAllByText(/Log In/);
      expect(screen.queryAllByText(/Log In/)[0]).toBeInTheDocument();
      // it should wipe the store
      expect(store.getState().deploy).toEqual({
        active_plans: {},
        appConfigs: {},
        apps: {},
        backupRps: {},
        backups: {},
        certificates: {},
        containers: {},
        databaseImages: {},
        databases: {},
        endpoints: {},
        environments: {},
        logDrains: {},
        metricDrains: {},
        operations: {},
        permissions: {},
        plans: {},
        releases: {},
        serviceDefinitions: {},
        services: {},
        stacks: {},
        vpc_peers: {},
        vpn_tunnels: {},
      });
    });
  });
});
