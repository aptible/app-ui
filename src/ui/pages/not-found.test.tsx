import { NotFoundPage } from "./not-found";

import { setupIntegrationTest } from "@app/test";
import { render, screen, waitFor } from "@testing-library/react";

describe("Not found page page", () => {
  it("the not found page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <NotFoundPage />
      </TestProvider>,
    );
    const el = await screen.queryByText("Page Not Found");
    await waitFor(() => {
      expect(el).toBeDefined;
    });
  });
});
