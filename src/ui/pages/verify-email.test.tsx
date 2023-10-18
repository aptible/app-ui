import { server, testEnv, testUser, testUserVerified } from "@app/mocks";
import { verifyEmailUrl } from "@app/routes";
import {
  setupAppIntegrationTest,
  setupIntegrationTest,
  waitForBootup,
} from "@app/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { rest } from "msw";
import { VerifyEmailPage } from "./verify-email";

describe("Verify email page", () => {
  describe("email confirmation page", () => {
    it("should redirect to dashboard", async () => {
      let counterA = 0;
      let counterB = 0;

      server.use(
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (_, res, ctx) => {
            counterA += 1;
            if (counterA === 1) {
              return res(ctx.json({ _embedded: [testUser] }));
            }
            return res(ctx.json({ _embedded: [testUserVerified] }));
          },
        ),
        rest.get(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
          counterB += 1;
          if (counterB === 1) {
            return res(ctx.json(testUser));
          }
          return res(ctx.json(testUserVerified));
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [verifyEmailUrl("111", "222")],
      });
      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("heading", {
        level: 1,
        name: /Choose your Environment/,
      });
    });
  });

  it("the verify email page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    await screen.findByRole("button", { name: /Resend Verification Email/ });
  });

  it("the verify email page should render and resend verification successfully", async () => {
    const { TestProvider } = setupIntegrationTest();

    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );

    const el = await screen.findByRole("button", {
      name: /Resend Verification Email/,
    });
    fireEvent.click(el);
  });

  it("the verify email page should properly fail", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/verifications`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );

    await screen.findByRole("button", { name: /Resend Verification Email/ });
    const errorText = screen.queryByText("Failed to verify your email");
    expect(errorText).toBeDefined;
  });

  it("the verify email page should render and raise error if resend verification errors", async () => {
    server.use(
      rest.post(
        `${testEnv.authUrl}/users/:userId/email_verification_challenges`,
        (_, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              code: 400,
              exception_context: {},
              error: "invalid_credentials",
              message: "mock error message",
            }),
          );
        },
      ),
    );
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );

    const el = await screen.findByRole("button", {
      name: /Resend Verification Email/,
    });
    fireEvent.click(el);
    await screen.findByText("mock error message");
  });
});
