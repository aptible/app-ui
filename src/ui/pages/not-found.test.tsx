import { NotFoundPage } from "./not-found";

import { setupIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";

describe("Not found page page", () => {
  it("the not found page should render", async () => {
    const { TestProvider, store } = setupIntegrationTest();
    await waitForBootup(store);
    render(
      <TestProvider>
        <NotFoundPage />
      </TestProvider>,
    );
    const el = screen.queryByText("Page Not Found");
    expect(el).toBeDefined;
  });
});
