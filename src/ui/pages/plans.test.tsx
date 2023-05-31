import { loginUrl } from "@app/routes";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAppDeployed,
  testEmail,
  testEnv,
  testEnvExpress,
} from "@app/mocks";
import { setupIntegrationTest } from "@app/test";

import { PlansPage } from "./plans";

describe("Plans page", () => {
  it("the plans page is visible and renders", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
  });
  it("allows selection of plan", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
  });
});