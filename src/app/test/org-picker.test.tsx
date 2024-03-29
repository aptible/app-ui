import { fireEvent, render, screen } from "@testing-library/react";

import { defaultStackResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testEnv,
  testOrg,
  testOrgReauth,
  testOrgSpecial,
  testStack,
  testUserOrgSelected,
  verifiedUserHandlers,
} from "@app/mocks";
import { orgPickerUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
import { rest } from "msw";

describe("Selecting an Organization", () => {
  it("should set the organization to the current user's `selected_organization` property if available", async () => {
    server.use(
      ...verifiedUserHandlers({ user: testUserOrgSelected }),
      rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
        return res(
          ctx.json({ _embedded: { organizations: [testOrg, testOrgSpecial] } }),
        );
      }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [orgPickerUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await waitForData(store, (state) => {
      return Object.values(state.organizations).length > 0;
    });

    expect(screen.queryAllByText(/Wow Org/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/Continue using/)).toBeInTheDocument();
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
      ...verifiedUserHandlers(),
      ...stacksWithResources({
        stacks: [testStack, testStackSpecial, testStackDontShow],
      }),
      rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
        return res(
          ctx.json({ _embedded: { organizations: [testOrg, testOrgSpecial] } }),
        );
      }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [orgPickerUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await waitForData(store, (state) => {
      return Object.values(state.organizations).length > 0;
    });
    const btn = await screen.findByRole("button", { name: /^test\-org\-1/i });
    fireEvent.click(btn);

    await screen.findByText(/Choose Organization/);
    const next = await screen.findByRole("button", { name: /^wow org/i });
    fireEvent.click(next);

    const stacks = await screen.findByRole("link", { name: /Stacks/ });
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
              _embedded: {
                organizations: [testOrg, testOrgSpecial, testOrgReauth],
              },
            }),
          );
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [orgPickerUrl()],
      });
      await waitForBootup(store);

      render(<App />);

      await waitForData(store, (state) => {
        return Object.values(state.organizations).length > 0;
      });
      const btn = await screen.findByRole("button", { name: /^test\-org\-1/i });
      fireEvent.click(btn);

      await screen.findByText(/Choose Organization/);
      const next = await screen.findByRole("button", { name: /^reauth org/i });
      fireEvent.click(next);

      // should redirect to login page
      await screen.findAllByText(/Log In/);
      expect(screen.queryAllByText(/Log In/)[0]).toBeInTheDocument();
      // it should wipe the store
      expect(store.getState()).toMatchObject({
        activePlans: {},
        activityReports: {},
        appConfigs: {},
        apps: {},
        backupRps: {},
        backups: {},
        certificates: {},
        containers: {},
        databaseCredentials: {},
        databaseImages: {},
        databases: {},
        disks: {},
        endpoints: {},
        environments: {},
        images: {},
        logDrains: {},
        metricDrains: {},
        operations: {},
        permissions: {},
        plans: {},
        releases: {},
        serviceDefinitions: {},
        services: {},
        stacks: {},
        vpcPeers: {},
        vpnTunnels: {},
      });
    });
  });
});
