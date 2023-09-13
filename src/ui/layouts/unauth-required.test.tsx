import { server, testEnv } from "@app/mocks";
import { homeUrl } from "@app/routes";
import { setupIntegrationTest, waitForToken } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import { UnauthRequired } from "./unauth-required";

const HomeMock = () => {
  return <div>Simulated home</div>;
};

describe("UnauthRequired", () => {
  it("should allow child to render without a redirect when current token expired", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      additionalRoutes: [
        {
          path: homeUrl(),
          element: <HomeMock />,
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
        <UnauthRequired>
          <div>Test element</div>
        </UnauthRequired>
      </TestProvider>,
    );
    const el = await screen.findByText("Test element");
    const home = screen.queryByText("Simulated home");
    expect(el).toBeInTheDocument();
    expect(home).not.toBeInTheDocument();
  });
  // if authed, expect redirect
  it("should redirect you to root when logged in", async () => {
    const { TestProvider, store } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      additionalRoutes: [
        {
          path: homeUrl(),
          element: <HomeMock />,
        },
      ],
    });

    await waitForToken(store);

    render(
      <TestProvider>
        <UnauthRequired>
          <div>Test element</div>
        </UnauthRequired>
      </TestProvider>,
    );
    const el = screen.queryByText("Test element");
    const home = await screen.findByText("Simulated home");
    expect(el).not.toBeInTheDocument();
    expect(home).toBeInTheDocument();
  });
});
