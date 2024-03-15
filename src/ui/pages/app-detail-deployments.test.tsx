import { server, stacksWithResources, testApp } from "@app/mocks";
import {
  APP_DETAIL_DEPLOYMENTS_PATH,
  appDetailDeploymentsUrl,
} from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { AppDetailDeploymentsPage } from "./app-detail-deployments";

describe("App Detail Deployments page", () => {
  it("should render deployments with proper fallbacks", async () => {
    server.use(...stacksWithResources({ apps: [testApp] }));
    const { store, TestProvider } = setupIntegrationTest({
      initEntries: [appDetailDeploymentsUrl(`${testApp.id}`)],
      path: APP_DETAIL_DEPLOYMENTS_PATH,
    });
    await waitForBootup(store);
    render(
      <TestProvider>
        <AppDetailDeploymentsPage />
      </TestProvider>,
    );

    const links = await screen.findAllByRole("link", { name: "a947a95" });
    expect(links[0].getAttribute("href")).toEqual(
      "https://github.com/aptible/app-ui/commit/a947a95a92e7a7a4db7fe01c28346281c128b859",
    );
    // expect(screen.queryByText(/quay.io\/aptible\/cloud-ui/)).toBeInTheDocument();
  });
});
