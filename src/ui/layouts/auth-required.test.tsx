import { AuthRequired } from "./auth-required";

import { server, testEnv, testUser } from "@app/mocks";
import { loginUrl, verifyEmailRequestUrl } from "@app/routes";
import { setupIntegrationTest } from "@app/test";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { rest } from "msw";

const LoginMock = () => {
  return <div>Simulated login</div>;
};
const VerifyMock = () => {
  return <div>Simulated verify</div>;
};
const mockUnverifiedUser = {
  users: [
    {
      ...testUser,
      verified: false,
    },
  ],
};

describe("AuthRequired", () => {
  it("should allow child to render without a redirect when current token active", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
    });
    render(
      <TestProvider>
        <AuthRequired />
        <h1>Test element</h1>
      </TestProvider>,
    );
    await waitForElementToBeRemoved(() => screen.queryByText("loading..."));
    expect(screen.queryByText("Test element")).toBeInTheDocument();
  });
  it("should redirect when current token expired", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      additionalRoutes: [
        {
          path: loginUrl(),
          element: <LoginMock />,
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
        <AuthRequired />
        <h1>Test element</h1>
      </TestProvider>,
    );
    await waitForElementToBeRemoved(() => screen.queryByText("loading..."));
    await screen.findByText("Simulated login");
    expect(screen.queryByText("Test element")).not.toBeInTheDocument();
  });
  it("should redirect when user is not yet verified", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
      initState: {
        env: {
          ...testEnv,
          origin: "nextgen",
        },
      },
      additionalRoutes: [
        {
          path: verifyEmailRequestUrl(),
          element: <VerifyMock />,
        },
      ],
    });
    server.use(
      rest.get(
        `${testEnv.authUrl}/organizations/:orgId/users`,
        (req, res, ctx) => {
          return res(
            ctx.json({
              _embedded: mockUnverifiedUser,
            }),
          );
        },
      ),
      rest.get(`${testEnv.authUrl}/users/:userId`, (req, res, ctx) => {
        return res(ctx.json(mockUnverifiedUser));
      }),
    );
    render(
      <TestProvider>
        <AuthRequired />
        <h1>Test element</h1>
      </TestProvider>,
    );
    await screen.findByText("Simulated verify");
    expect(screen.queryByText("Test element")).not.toBeInTheDocument();
  });
});
