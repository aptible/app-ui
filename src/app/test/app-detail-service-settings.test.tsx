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
import type { DeployServiceResponse } from "@app/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    await screen.findByText(/Service Deployment Settings/);
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

      await screen.findByText(/Service Deployment Settings/);
      await screen.findByText(/for services with endpoints/);
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

  describe("stop timeout configuration", () => {
    it("should handle stop timeout configuration", async () => {
      const updatedService: DeployServiceResponse = { ...testServiceRails };
      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [updatedService],
        }),
        rest.put(`${testEnv.apiUrl}/services/:id`, async (req, res, ctx) => {
          const data = await req.json();
          Object.assign(updatedService, data);
          return res(ctx.json(updatedService));
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

      const stopTimeoutInput = await screen.findByLabelText(/Stop Timeout/);
      expect(stopTimeoutInput).toBeInTheDocument();
      expect(stopTimeoutInput).toHaveAttribute("type", "number");
      expect(stopTimeoutInput).toHaveAttribute("max", "900");
      expect(stopTimeoutInput).toHaveAttribute("min", "0");

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "300");
      expect(stopTimeoutInput).toHaveValue(300);

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "1000");
      expect(stopTimeoutInput).toHaveValue(900);

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "-1");
      expect(stopTimeoutInput).toHaveValue(0);
    });

    it("should handle null stop timeout value", async () => {
      const updatedService: DeployServiceResponse = {
        ...testServiceRails,
        stop_timeout: null,
      };
      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [updatedService],
        }),
        rest.put(`${testEnv.apiUrl}/services/:id`, async (req, res, ctx) => {
          const data = await req.json();
          Object.assign(updatedService, data);
          return res(ctx.json(updatedService));
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

      const stopTimeoutInput = await screen.findByLabelText(/Stop Timeout/);
      expect(stopTimeoutInput).toHaveValue(null);

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "300");
      expect(stopTimeoutInput).toHaveValue(300);

      await userEvent.clear(stopTimeoutInput);
      expect(stopTimeoutInput).toHaveValue(null);
    });

    it("should handle save button state correctly", async () => {
      const updatedService: DeployServiceResponse = {
        ...testServiceRails,
        stop_timeout: 300,
      };
      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [updatedService],
        }),
        rest.put(`${testEnv.apiUrl}/services/:id`, async (req, res, ctx) => {
          const data = await req.json();
          Object.assign(updatedService, data);
          return res(ctx.json(updatedService));
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

      const stopTimeoutInput = await screen.findByLabelText(/Stop Timeout/);
      const saveButton = await screen.findByRole("button", {
        name: /Save Changes/,
      });

      expect(saveButton).toBeDisabled();

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "400");
      expect(saveButton).toBeEnabled();

      await userEvent.clear(stopTimeoutInput);
      await userEvent.type(stopTimeoutInput, "300");
      expect(saveButton).toBeDisabled();
    });
  });
});
