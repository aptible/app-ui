import { server, testEnv, testUser, verifiedUserHandlers } from "@app/mocks";
import { loginUrl, verifyEmailRequestUrl } from "@app/routes";
import { setupIntegrationTest } from "@app/test";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { rest } from "msw";
import { AllRequired } from "./auth-required";

const LoginMock = () => {
  return <div>Simulated login</div>;
};
const VerifyMock = () => {
  return <div>Simulated verify</div>;
};

describe("AllRequired", () => {
  it("should allow child to render without a redirect when current token active", async () => {
    server.use(...verifiedUserHandlers());
    const { TestProvider } = setupIntegrationTest({
      path: "/mock",
      initEntries: ["/mock"],
    });
    render(
      <TestProvider>
        <AllRequired>
          <h1>Test element</h1>
        </AllRequired>
      </TestProvider>,
    );
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading token/));
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
        <AllRequired />
        <h1>Test element</h1>
      </TestProvider>,
    );
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading token/));
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
          origin: "app",
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
        (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: { users: [testUser] },
            }),
          );
        },
      ),
      rest.get(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
        return res(ctx.json(testUser));
      }),
    );
    render(
      <TestProvider>
        <div>
          <AllRequired />
          <h1>Test element</h1>
        </div>
      </TestProvider>,
    );
    await screen.findByText("Simulated verify");
    expect(screen.queryByText("Test element")).not.toBeInTheDocument();
  });
});
