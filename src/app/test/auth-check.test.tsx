import {
  server,
  testElevatedToken,
  testEnv,
  testToken,
  verifiedUserHandlers,
} from "@app/mocks";
import { appsUrl, homeUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("Loading app", () => {
  describe("user with expired token", () => {
    it("should be sent to login page", async () => {
      server.use(
        ...verifiedUserHandlers(),
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.status(401), ctx.json({}));
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [appsUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("heading", { name: /Log In/ });
      expect(
        screen.queryByRole("heading", { name: /Log In/ }),
      ).toBeInTheDocument();
    });
  });

  describe("`/current_token` returns manage token", () => {
    it("should be sent to dashboard page", async () => {
      server.use(
        ...verifiedUserHandlers(),
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.json(testToken));
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [homeUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("heading", { name: "Choose an Option" });
      expect(
        screen.queryByRole("heading", { name: "Choose an Option" }),
      ).toBeInTheDocument();
    });
  });

  describe("`/current_token` returns elevated token", () => {
    it("should be sent to dashboard page", async () => {
      server.use(
        ...verifiedUserHandlers(),
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.json(testElevatedToken));
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [homeUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("heading", { name: "Choose an Option" });
      expect(
        screen.queryByRole("heading", { name: "Choose an Option" }),
      ).toBeInTheDocument();
    });
  });
});
