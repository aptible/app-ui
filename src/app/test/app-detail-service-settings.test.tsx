import { hasDeployApp, selectAppById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEndpoint,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { appServiceSettingsPathUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("AppDetailServiceSettingsPage", () => {
  it("should successfully show app service scale page happy path", async () => {
    server.use(
      ...verifiedUserHandlers(),
      ...stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
        services: [{ ...testServiceRails, force_zero_downtime: true }],
      }),
    );
    const { App, store } = setupAppIntegrationTest({
      initEntries: [
        appServiceSettingsPathUrl(`${testApp.id}`, `${testServiceRails.id}`),
      ],
    });

    await waitForBootup(store);

    render(<App />);
    await waitForData(store, (state) => {
      return hasDeployApp(selectAppById(state, { id: `${testApp.id}` }));
    });

    await screen.findByText(/Service Settings/);
    const zddCheckbox = await screen.findByRole("checkbox", {
      name: "zero-downtime",
    });
    const simpleHealthcheckCheckbox = await screen.findByRole("checkbox", {
      name: "simple-healthcheck",
    });

    expect(zddCheckbox).toBeInTheDocument();
    expect(simpleHealthcheckCheckbox).toBeInTheDocument();
    expect(zddCheckbox).toBeChecked();
    expect(simpleHealthcheckCheckbox).not.toBeChecked();
  });

  describe("when endpoints are configured", () => {
    it("should not show configuration, instead pointing at endpoints", async () => {
      server.use(
        rest.get(`${testEnv.apiUrl}/services/:id/vhosts`, (_, res, ctx) => {
          return res(ctx.json({ _embedded: { vhosts: [testEndpoint] } }));
        }),
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [{ ...testServiceRails, force_zero_downtime: true }],
        }),
      );
      const { App, store } = setupAppIntegrationTest({
        initEntries: [
          appServiceSettingsPathUrl(`${testApp.id}`, `${testServiceRails.id}`),
        ],
      });

      await waitForBootup(store);

      render(<App />);
      await waitForData(store, (state) => {
        return hasDeployApp(selectAppById(state, { id: `${testApp.id}` }));
      });

      await screen.findByText(/Service Settings/);
      await screen.findByText(/managed through the following Endpoints/);
      const zddCheckbox = screen.queryByRole("checkbox", {
        name: "zero-downtime",
      });
      const simpleHealthcheckCheckbox = screen.queryByRole("checkbox", {
        name: "simple-healthcheck",
      });
      expect(zddCheckbox).not.toBeInTheDocument();
      expect(simpleHealthcheckCheckbox).not.toBeInTheDocument();
    });
  });
});
