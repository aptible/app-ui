import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { server, testApp, testEnv, testUser } from "@app/mocks";
import { setupAppIntegrationTest, waitForToken } from "@app/test";
import { rest } from "msw";

describe("Create project flow", () => {
  describe("existing user with ssh keys", () => {
    it("should successfully provision resources within an environment", async () => {
      server.use(
        rest.get(`${testEnv.apiUrl}/apps/:id`, (_, res, ctx) => {
          return res(ctx.json(testApp));
        }),
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (req, res, ctx) => {
            return res(
              ctx.json({
                _embedded: { users: [{ ...testUser, verified: true }] },
              }),
            );
          },
        ),
      );
      const { App, store } = setupAppIntegrationTest({
        initEntries: ["/create"],
      });
      render(<App />);

      await waitForToken(store);

      // deploy code landing page
      const el = screen.getByRole("link", {
        name: /Deploy with Git Push/,
      });
      expect(el.textContent).toMatch(/Deploy with Git Push/);
      // go to next page
      fireEvent.click(el);

      // create environment page
      const nameInput = await screen.findByRole("textbox", { name: "name" });
      await act(async () => {
        await userEvent.type(nameInput, "test-project");
      });

      const btn = await screen.findByRole("button", {
        name: /Create Environment/,
      });
      // go to next page
      fireEvent.click(btn);

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
