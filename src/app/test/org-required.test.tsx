import { server, testEnv, verifiedUserHandlers } from "@app/mocks";
import { orgPickerUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("No org banner", () => {
  describe("when org selected", () => {
    it("should *not* show banner to user", async () => {
      server.use(...verifiedUserHandlers());

      const { App, store } = setupAppIntegrationTest({
        initEntries: [orgPickerUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      expect(
        screen.queryByText(/No Organization selected/),
      ).not.toBeInTheDocument();
    });
  });

  describe("when no org selected", () => {
    it("should show banner to user", async () => {
      server.use(
        ...verifiedUserHandlers(),
        rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
          return res(ctx.json({ _embedded: { organizations: [] } }));
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [orgPickerUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(/No Organization selected/);
      expect(
        screen.queryByText(/No Organization selected/),
      ).toBeInTheDocument();
    });
  });
});
