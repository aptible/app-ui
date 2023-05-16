import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ForgotPassPage, ForgotPassVerifyPage } from "./forgot-pass";
import { testEmail } from "@app/mocks";
import { RESET_PASSWORD_PATH, resetPassVerify } from "@app/routes";
import { setupIntegrationTest } from "@app/test";

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
    expect(alert.textContent).toEqual(
      "Success! Check your email to change your password.",
    );
    expect(
      btn,
      "when already reset password the btn should be disabled",
    ).toBeDisabled();
  });
});

describe("ForgotPassVerifyPage", () => {
  it("should allow user to change their password", async () => {
    const { TestProvider } = setupIntegrationTest({
      path: RESET_PASSWORD_PATH,
      initEntries: [resetPassVerify("111", "222")],
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
    expect(alert.textContent).toEqual("Success! Continue to login");
    expect(
      btn,
      "when already reset password the btn should be disabled",
    ).toBeDisabled();
  });
});
