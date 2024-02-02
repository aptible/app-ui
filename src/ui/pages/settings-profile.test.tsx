import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { setupIntegrationTest } from "@app/test";
import { SettingsProfilePage } from "./settings-profile";

describe("ForgotPassPage", () => {
  it("should hide sanitize name input", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <SettingsProfilePage />
      </TestProvider>,
    );

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "<test>!#@"));

    expect(name).toHaveValue("not-verified&lt;test&gt;!#@");
  });
  it("should *not* allow symbols in name", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <SettingsProfilePage />
      </TestProvider>,
    );

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "<test>!#@"));

    const el = await screen.findByRole("button", { name: "Save Changes" });
    fireEvent.click(el);

    expect(
      await screen.findByText("Cannot have symbols in name"),
    ).toBeInTheDocument();
  });
});
