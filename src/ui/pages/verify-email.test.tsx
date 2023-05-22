import { VerifyEmailPage } from "./verify-email";

import { server, testEnv } from "@app/mocks";
import { setupIntegrationTest } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("Verify email page", () => {
  it("the verify email page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button");
    expect(el.textContent).toEqual("Resend Verification Email");
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
    const el = await screen.findByRole("button");
    const errorText = await screen.queryByText("Failed to verify your email");
    expect(errorText).toBeDefined;
    expect(el.textContent).toEqual("Resend Verification Email");
  });
});
