import { server, stacksWithResources, testApp, verifiedUserHandlers } from "@app/mocks";
import {
  appDetailDeploymentsUrl,
} from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";

describe("App Detail Deployments page", () => {
  it("should render deployments with proper fallbacks", async () => {
    server.use(
      ...stacksWithResources({ apps: [testApp] }),
      ...verifiedUserHandlers(),
    );
    const { store, App } = setupAppIntegrationTest({
      initEntries: [appDetailDeploymentsUrl(`${testApp.id}`)],
    });
    await waitForBootup(store);
    const { container } = render(
      <App />
    );

    await screen.findAllByRole("link", { name: "a947a95" });
    expect(container).toMatchSnapshot();
  });
});
