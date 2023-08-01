import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { defaultHalHref } from "@app/hal";
import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testConfiguration,
  testDatabasePostgres,
  testEnv,
  testUserVerified,
} from "@app/mocks";
import { setupAppIntegrationTest, waitForToken } from "@app/test";
import { rest } from "msw";

describe("Create App flow", () => {
  describe("existing user with ssh keys", () => {
    it("should successfully provision resources within an environment", async () => {
      server.use(
        ...stacksWithResources({ databases: [testDatabasePostgres] }),
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
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: { users: [testUserVerified] },
              }),
            );
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [`/create/name?environment_id=${testAccount.id}`],
      });

      render(<App />);

      await waitForToken(store);

      // create app page
      const nameInput = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(nameInput, "a-new-hope"));

      const btn = await screen.findByRole("button", {
        name: /Create App/,
      });
      // go to next page
      fireEvent.click(btn);

      // push your code page
      await screen.findByText(/Push your code to Aptible/);

      // settings page
      await screen.findByText(/Configure your App/);

      const dbBtn = await screen.findByRole("button", {
        name: /Connect Existing Database/,
      });
      fireEvent.click(dbBtn);

      const dbSelector = await screen.findByRole("combobox", {
        name: /existing-db/,
      });
      await act(() =>
        userEvent.selectOptions(dbSelector, "test-app-1-postgres (postgres)"),
      );
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
      const status = await screen.findByText(/Deployed today/);
      expect(status).toBeInTheDocument();

      await screen.findByText("Initial configuration");
      await screen.findByText("App deployment");
      await screen.findByText("Database provision test-app-1-postgres");
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
