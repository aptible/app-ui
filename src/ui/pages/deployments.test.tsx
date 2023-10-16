import { fireEvent, render, screen } from "@testing-library/react";

import { defaultAppResponse, defaultEnvResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  createText,
  server,
  stacksWithResources,
  testAppDeployed,
  testEnv,
  testEnvExpress,
  testOrg,
  testStack,
} from "@app/mocks";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { DeploymentsPage } from "./deployments";

describe("Deployments page", () => {
  it("should show last deployment status", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testEnvExpress],
        apps: [testAppDeployed],
      }),
    );

    const { store, TestProvider } = setupIntegrationTest();

    await waitForBootup(store);

    render(
      <TestProvider>
        <DeploymentsPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("link", { name: /Deploy/ });
    expect(btn).toBeInTheDocument();
    expect(await screen.findByText(testAppDeployed.handle)).toBeInTheDocument();
    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/Deployed 04\/08\/2023/);
  });

  it("should show a list of apps for accounts filtered by `accounts` query param", async () => {
    const envExpress = defaultEnvResponse({
      id: createId(),
      handle: createText("express"),
      organization_id: testOrg.id,
      onboarding_status: "initiated",
      _links: {
        stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
      },
    });
    const envLaravel = defaultEnvResponse({
      id: createId(),
      handle: createText("laravel"),
      organization_id: testOrg.id,
      onboarding_status: "completed",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
      },
    });
    const accounts = [envExpress, envLaravel];
    const apps = [
      defaultAppResponse({
        id: createId(),
        handle: `${envExpress.handle}-app`,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envExpress.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: "some-random-express-app",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envExpress.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: `${envLaravel.handle}-app`,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envLaravel.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
    ];

    server.use(
      ...stacksWithResources({
        accounts,
        apps,
      }),
    );

    const { store, TestProvider } = setupIntegrationTest({
      initEntries: [`/?accounts=${envExpress.id}`],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <DeploymentsPage />
      </TestProvider>,
    );

    expect(await screen.findByText(apps[0].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[1].handle)).toBeInTheDocument();
    // we shouldn't see the laravel app
    expect(screen.queryByText(apps[2].handle)).not.toBeInTheDocument();

    // reset query params
    const resetBtn = await screen.findByText("Show All");
    fireEvent.click(resetBtn);

    // should see all apps nows
    expect(await screen.findByText(apps[0].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[1].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[2].handle)).toBeInTheDocument();
  });

  it("should show a list of apps for accounts filtered by onboarding status for ftux", async () => {
    const envExpress = defaultEnvResponse({
      id: createId(),
      handle: createText("express"),
      organization_id: testOrg.id,
      onboarding_status: "initiated",
      _links: {
        stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
      },
    });
    const envLaravel = defaultEnvResponse({
      id: createId(),
      handle: createText("laravel"),
      organization_id: testOrg.id,
      onboarding_status: "completed",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
      },
    });
    const envLegacy = defaultEnvResponse({
      id: createId(),
      handle: createText("legacy"),
      organization_id: testOrg.id,
      onboarding_status: "unknown",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
      },
    });
    const accounts = [envExpress, envLaravel, envLegacy];
    const apps = [
      defaultAppResponse({
        id: createId(),
        handle: `${envExpress.handle}-app`,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envExpress.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: "some-random-express-app",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envExpress.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: `${envLaravel.handle}-app`,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envLaravel.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: `${envLegacy.handle}-app`,
        _links: {
          account: defaultHalHref(`${testEnv.apiUrl}/accounts/${envLegacy.id}`),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      }),
    ];

    server.use(
      ...stacksWithResources({
        accounts,
        apps,
      }),
    );

    const { store, TestProvider } = setupIntegrationTest();

    await waitForBootup(store);

    render(
      <TestProvider>
        <DeploymentsPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("link", { name: /Deploy/ });
    expect(btn).toBeInTheDocument();
    expect(await screen.findByText(apps[0].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[1].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[2].handle)).toBeInTheDocument();
    expect(screen.queryByText(apps[3].handle)).not.toBeInTheDocument();
  });
});
