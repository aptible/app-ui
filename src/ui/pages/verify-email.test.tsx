import { VerifyEmailPage } from "./verify-email";

import { server, testEnv } from "@app/mocks";
import { setupIntegrationTest } from "@app/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("Verify email page", () => {
  it("the verify email page should render", async () => {
    const { TestProvider } = setupIntegrationTest({
      initState: {
        env: {
          ...testEnv,
          origin: "nextgen",
        },
      },
    });
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    await screen.findByRole("button", { name: /Resend Verification Email/ });
  });
  it("the verify email page should render and resend verification successfully", async () => {
    const { TestProvider } = setupIntegrationTest({
      initState: {
        env: {
          ...testEnv,
          origin: "nextgen",
        },
      },
    });
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button", {
      name: /Resend Verification Email/,
    });
    await fireEvent.click(el);
  });
  it("the verify email page should properly fail", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    server.use(
      rest.get(`${testEnv.authUrl}/verifications`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    await screen.findByRole("button", { name: /Resend Verification Email/ });
    const errorText = await screen.queryByText("Failed to verify your email");
    expect(errorText).toBeDefined;
  });
  it("the verify email page should render and raise error if resend verification errors", async () => {
    const { TestProvider } = setupIntegrationTest({
      initState: {
        env: {
          ...testEnv,
          origin: "nextgen",
        },
      },
    });
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    server.use(
      rest.post(
        `${testEnv.authUrl}/users/:userId/email_verification_challenges`,
        (_, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.set("Content-Type", "application/json"),
            ctx.json({
              code: 401,
              exception_context: {},
              error: "invalid_credentials",
              message: "mock error message",
            }),
          );
        },
      ),
    );
    const el = await screen.findByRole("button", {
      name: /Resend Verification Email/,
    });
    await fireEvent.click(el);
    await screen.queryByText("mock error message");
  });
});
