import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import { defaultHalHref } from "@app/hal";
import {
  server,
  testAccount,
  testApp,
  testConfiguration,
  testElevatedToken,
  testEnv,
  testRoleOwner,
  testSshKey,
  verifiedUserHandlers,
} from "@app/mocks";
import { getStartedUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { deserializeToken } from "@app/token";

describe("App deploy flow", () => {
  describe("existing user *without* ssh keys", () => {
    it("should ask user to add SSH keys before proceeding", async () => {
      server.use(
        ...verifiedUserHandlers({ role: testRoleOwner }),
        rest.get(`${testEnv.apiUrl}/apps/:id`, (_, res, ctx) => {
          return res(
            ctx.json({
              ...testApp,
              _links: {
                account: defaultHalHref(
                  `${testEnv.apiUrl}/accounts/${testAccount.id}`,
                ),
                current_configuration: defaultHalHref(
                  `${testEnv.apiUrl}/configurations/${testConfiguration.id}`,
                ),
              },
            }),
          );
        }),
        rest.get(`${testEnv.authUrl}/users/:userId/ssh_keys`, (_, res, ctx) => {
          return res(ctx.json({ _embedded: { ssh_keys: [] } }));
        }),
        rest.post(
          `${testEnv.authUrl}/users/:userId/ssh_keys`,
          (_, res, ctx) => {
            return res(ctx.json({ _embedded: { ssh_keys: [testSshKey] } }));
          },
        ),
        rest.get(`${testEnv.apiUrl}/apps/:id/operations`, (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: { operations: [] },
            }),
          );
        }),
      );
      const { App, store } = setupAppIntegrationTest({
        initState: {
          elevatedToken: deserializeToken(testElevatedToken),
        },
        initEntries: [getStartedUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      // deploy code landing page
      const el = await screen.findByRole("link", {
        name: /Get Started/,
      });
      // go to next page
      fireEvent.click(el);

      // create environment page
      const nameInput = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(nameInput, "test-project"));

      const btn = await screen.findByRole("button", {
        name: /Create Environment/,
      });
      // go to next page
      fireEvent.click(btn);

      // create app page
      await screen.findByText(/test-account/);
      const appNameInput = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(appNameInput, "test-project"));

      const appBtn = await screen.findByRole("button", {
        name: /Create App/,
      });
      // go to next page
      fireEvent.click(appBtn);

      await screen.findByText(/Paste Public SSH Key/);
      const keyTextArea = await screen.findByLabelText(
        "Step 2. Paste Public SSH Key",
      );
      await act(() => userEvent.type(keyTextArea, "here is a public key"));

      const keyBtn = await screen.findByRole("button", { name: /Save Key/ });
      fireEvent.click(keyBtn);

      // push your code page
      await screen.findByText(/Push your code to Aptible/);
      expect(true).toBe(true);
    });
  });

  describe("existing user with ssh keys", () => {
    it("should successfully provision resources within an environment", async () => {
      server.use(
        rest.get(`${testEnv.apiUrl}/apps/:id`, (_, res, ctx) => {
          return res(
            ctx.json({
              ...testApp,
              _links: {
                account: defaultHalHref(
                  `${testEnv.apiUrl}/accounts/${testAccount.id}`,
                ),
                current_configuration: defaultHalHref(
                  `${testEnv.apiUrl}/configurations/${testConfiguration.id}`,
                ),
              },
            }),
          );
        }),
        ...verifiedUserHandlers({ role: testRoleOwner }),
      );
      const { App, store } = setupAppIntegrationTest({
        initEntries: [getStartedUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      // deploy code landing page
      const el = await screen.findByRole("link", {
        name: /Get Started/,
      });
      // go to next page
      fireEvent.click(el);

      // create environment page
      const nameInput = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(nameInput, "test-project"));

      const btn = await screen.findByRole("button", {
        name: /Create Environment/,
      });
      // go to next page
      fireEvent.click(btn);

      // create app page
      await screen.findByText(/test-account/);
      const appNameInput = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(appNameInput, "test-project"));

      const appBtn = await screen.findByRole("button", {
        name: /Create App/,
      });
      // go to next page
      fireEvent.click(appBtn);

      // push your code page
      await screen.findByText(/Push your code to Aptible/);

      // settings page
      await screen.findByText(/Configure your App/);

      const banner = await screen.findByRole("status");
      expect(banner.textContent).toMatch(/Your code has a Dockerfile/);

      const dbBtn = await screen.findByRole("button", {
        name: /New Database/,
      });
      fireEvent.click(dbBtn);

      const dbSelector = await screen.findByRole("combobox");
      userEvent.selectOptions(dbSelector, "postgres v14");
      const dbEnvVar = await screen.findByRole("textbox", { name: "envvar" });
      expect(dbEnvVar).toHaveDisplayValue("DATABASE_URL");

      const saveBtn = await screen.findByRole("button", {
        name: /Save & Deploy/,
      });

      // go to next page
      fireEvent.click(saveBtn);

      // status page
      await screen.findByRole("link", {
        name: /View Environment/,
      });
      const status = await screen.findByText(/Deployed \d+\/\d+\/\d+/);
      expect(status).toBeInTheDocument();

      await screen.findByText("Initial configuration");
      await screen.findByText("Database provision test-app-1-postgres");
      await screen.findByText("App deployment");
      let ops = await screen.findAllByText("DONE");
      expect(ops.length).toEqual(3);

      // create https endpoint
      await screen.findByText(/Which service needs an/);

      const vhostSelector = await screen.findAllByRole("radio");
      fireEvent.click(vhostSelector[0]);
      const httpBtn = await screen.findByRole("button", {
        name: "Create Endpoint",
      });
      fireEvent.click(httpBtn);

      await screen.findByText("HTTPS endpoint provision");
      ops = await screen.findAllByText("DONE");
      expect(ops.length).toEqual(4);
    });
  });
});
