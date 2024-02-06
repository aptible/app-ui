import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { server, testEmail, testEnv } from "@app/mocks";
import { RESET_PASSWORD_PATH, resetPassVerifyUrl } from "@app/routes";
import { setupIntegrationTest } from "@app/test";
import { rest } from "msw";
import { ForgotPassPage, ForgotPassVerifyPage } from "./forgot-pass";

describe("ForgotPassPage", () => {
  it("should allow user to request a password reset", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <ForgotPassPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    expect(btn, "when no text the btn should be disabled").toBeDisabled();

    const inp = await screen.findByRole("textbox");
    await act(async () => {
      await userEvent.type(inp, testEmail);
    });
    expect(btn, "when text the btn should be enabled").toBeEnabled();

    fireEvent.click(btn);

    const alert = await screen.findByRole("status");
    expect(alert.textContent).toMatch(
      /If an Aptible account exists for that email address, we will email you instructions for resetting your password./,
    );
    expect(
      btn,
      "when already reset password the btn should be disabled",
    ).toBeDisabled();
  });

  it("should hide a User not found email", async () => {
    server.use(
      rest.post(`${testEnv.authUrl}/password/resets/new`, (_, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: "invalid_email", ok: false }),
        );
      }),
    );
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <ForgotPassPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, "abc@abc.com"));

    fireEvent.click(btn);

    const alert = await screen.findByRole("status");
    expect(alert.textContent).toMatch(
      /If an Aptible account exists for that email address, we will email you instructions for resetting your password./,
    );
  });
});

describe("ForgotPassVerifyPage", () => {
  it("should allow user to change their password", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: RESET_PASSWORD_PATH,
      initEntries: [resetPassVerifyUrl("111", "222")],
    });
    render(
      <TestProvider>
        <ForgotPassVerifyPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    expect(btn, "when no text the btn should be disabled").toBeDisabled();

    const inp = await screen.findByLabelText("New Password");
    await act(async () => {
      await userEvent.type(inp, "1234");
    });
    expect(btn, "when text the btn should be enabled").toBeEnabled();

    fireEvent.click(btn);

    const alert = await screen.findByRole("status");
    expect(alert.textContent).toMatch(/Success! Continue to login/);
    expect(
      btn,
      "when already reset password the btn should be disabled",
    ).toBeDisabled();
  });
});
