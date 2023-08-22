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
import { setupAppIntegrationTest, waitForBootup } from "@app/test";

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

      await waitForBootup(store);

      render(<App />);

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

      await waitForBootup(store);

      render(<App />);

      expect(
        screen.queryByText(/You must first deprovision any existing/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have "Destroy" permissions/),
      ).not.toBeInTheDocument();

      const input = await screen.findByRole("textbox", {
        name: /delete-confirm/,
      });
      await act(() => userEvent.type(input, testDestroyAccount.handle));

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
