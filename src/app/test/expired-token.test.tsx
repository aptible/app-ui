import { server, testEnv } from "@app/mocks";
import { appsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("Loading app", () => {
  describe("user with expired token", () => {
    it("should be sent to login page", async () => {
      server.use(
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
});
