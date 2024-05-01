import {
  server,
  stacksWithResources,
  testApp,
  verifiedUserHandlers,
} from "@app/mocks";
import {
  APP_DETAIL_DEPLOYMENTS_PATH,
  appDetailDeploymentsUrl,
} from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { AppDetailDeploymentsPage } from "./app-detail-deployments";

describe("App Detail Deployments page", () => {
  it("should render deployments with proper fallbacks", async () => {
    server.use(
      ...stacksWithResources({ apps: [testApp] }),
      ...verifiedUserHandlers(),
    );
    const { store, TestProvider } = setupIntegrationTest({
      initEntries: [appDetailDeploymentsUrl(`${testApp.id}`)],
      path: APP_DETAIL_DEPLOYMENTS_PATH,
    });
    await waitForBootup(store);
    const { container } = render(
      <TestProvider>
        <AppDetailDeploymentsPage />
      </TestProvider>,
    );

    await screen.findAllByRole("link", { name: /a947a95/ });
    expect(container).toMatchSnapshot();
  });
});
