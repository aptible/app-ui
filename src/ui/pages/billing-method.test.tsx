import { BillingMethodPage } from "./billing-method";
import { setupIntegrationTest } from "@app/test";
import { render, screen, waitFor } from "@testing-library/react";

describe("Billing Method page", () => {
  it("the billing method page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <BillingMethodPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button");
    await waitFor(() => {
      expect(el.textContent).toEqual("Save & Finish");
    });
  });
});
