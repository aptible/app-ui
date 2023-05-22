import { UnauthRequired } from "./unauth-required";

import { server, testEnv } from "@app/mocks";
import { homeUrl } from "@app/routes";
import { setupIntegrationTest } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("UnauthRequired", () => {
  it("should allow child to render without a redirect when current token expired", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      additionalRoutes: [
        {
          path: homeUrl(),
          element: <p>Simulated home</p>,
        },
      ],
    });
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(200));
      }),
    );
    render(
      <TestProvider>
        <div>
          <UnauthRequired />
          <p>Test element</p>
        </div>
      </TestProvider>,
    );
    const el = await screen.findByText("Test element");
    const home = await screen.queryByText("Simulated home");
    expect(el.textContent).toBeDefined;
    expect(home).toBeNull;
  });
  // if authed, expect redirect
  it("should redirect you to root when logged in", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      additionalRoutes: [
        {
          path: homeUrl(),
          element: <p>Simulated home</p>,
        },
      ],
    });
    render(
      <TestProvider>
        <div>
          <UnauthRequired />
          <p>Test element</p>
        </div>
      </TestProvider>,
    );
    const el = await screen.queryByText("Test element");
    const home = await screen.findByText("Simulated home");
    expect(el).toBeNull;
    expect(home.textContent).toBeDefined;
  });
});
