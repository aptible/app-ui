import { LoginPage } from "./login";
import { setupIntegrationTest } from "@app/test";
import { render, screen } from "@testing-library/react";

describe("Login page", () => {
  it("the log in button is visible", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button");
    expect(el.textContent).toEqual("Log In");
  });
});
