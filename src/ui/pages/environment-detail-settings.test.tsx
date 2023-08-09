import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testApp,
  testDatabasePostgres,
  testDestroyAccount,
  verifiedUserHandlers,
} from "@app/mocks";
import { environmentSettingsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForEnv, waitForToken } from "@app/test";

describe("EnvironmentSettingsPage", () => {
  describe("when the environment still has resources", () => {
    it("should display an error message and have the submit button disabled", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [
            {
              ...testDestroyAccount,
              total_app_count: 1,
              total_database_count: 1,
            },
          ],
          databases: [testDatabasePostgres],
          apps: [testApp],
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [environmentSettingsUrl(`${testDestroyAccount.id}`)],
      });

      render(<App />);

      await waitForToken(store);
      await waitForEnv(store, testDestroyAccount.id);

      await screen.findByText(/You must first deprovision any existing/);
      expect(
        screen.queryByText(/You must first deprovision any existing/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have "Destroy" permissions/),
      ).not.toBeInTheDocument();

      const btn = await screen.findByRole("button", {
        name: /Deprovision Environment/,
      });
      expect(btn).toBeDisabled();
    });
  });

  describe("when the environment has no resources", () => {
    it("should deprovision environment and go to environments page", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testDestroyAccount],
          databases: [testDatabasePostgres],
          apps: [testApp],
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [environmentSettingsUrl(`${testDestroyAccount.id}`)],
      });

      render(<App />);

      await waitForToken(store);
      await waitForEnv(store, testDestroyAccount.id);

      expect(
        screen.queryByText(/You must first deprovision any existing/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have "Destroy" permissions/),
      ).not.toBeInTheDocument();

      const input = await screen.findByRole("textbox", {
        name: /Confirm Name/,
      });
      await act(async () => {
        await userEvent.type(input, testDestroyAccount.handle);
      });

      const btn = await screen.findByRole("button", {
        name: /Deprovision Environment/,
      });
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);

      // activity page
      await screen.findByRole("heading", { name: /Environments/ });
    });
  });
});
