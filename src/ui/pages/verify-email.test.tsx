import { VerifyEmailPage } from "./verify-email";

import { setupIntegrationTest } from "@app/test";
import { render, screen, waitFor } from "@testing-library/react";

describe("Verify email page", () => {
  it("the verify email page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <VerifyEmailPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button");
    await waitFor(() => {
      expect(el.textContent).toEqual("Resend Verification Email");
    });
  });
});
