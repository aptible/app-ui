import { fireEvent, render, screen } from "@testing-library/react";

import { DeploymentsPage } from "./create-project-git";
import {
  defaultAppResponse,
  defaultEnvResponse,
  defaultOperationResponse,
} from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  createText,
  server,
  stacksWithResources,
  testEnv,
  testStack,
} from "@app/mocks";
import { setupIntegrationTest } from "@app/test";

describe("Deployments page", () => {
  it("should show last deployment status", async () => {
    const envExpress = defaultEnvResponse({
      id: createId(),
      handle: createText("express"),
      onboarding_status: "initiated",
      _links: {
        stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
        environment: defaultHalHref(),
      },
    });
    const accounts = [envExpress];
    const appId = createId();
    const app = defaultAppResponse({
      id: appId,
      handle: `${envExpress.handle}-app`,
      _links: {
        account: defaultHalHref(`${testEnv.apiUrl}/accounts/${envExpress.id}`),
        current_configuration: defaultHalHref(),
      },
      _embedded: {
        services: [],
        current_image: null,
        last_operation: null,
        last_deploy_operation: defaultOperationResponse({
          id: createId(),
          type: "deploy",
          status: "succeeded",
          updated_at: new Date("2023-04-08T14:00:00.0000").toISOString(),
          _links: {
            resource: defaultHalHref(`${testEnv.apiUrl}/apps/${appId}`),
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${envExpress.id}`,
            ),
            code_scan_result: defaultHalHref(),
            ephemeral_sessions: defaultHalHref(),
            logs: defaultHalHref(),
            ssh_portal_connections: defaultHalHref(),
            self: defaultHalHref(),
            user: defaultHalHref(),
          },
        }),
      },
    });

    server.use(
      ...stacksWithResources({
        accounts,
        apps: [app],
      }),
    );

    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <DeploymentsPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    expect(btn).toBeInTheDocument();
    expect(await screen.findByText(app.handle)).toBeInTheDocument();
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Deployed 04/08/2023");
  });

  it("should show a list of apps for accounts filtered by `accounts` query param", async () => {
    const envExpress = defaultEnvResponse({
      id: createId(),
      handle: createText("express"),
      onboarding_status: "initiated",
      _links: {
        stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
        environment: defaultHalHref(),
      },
    });
    const envLaravel = defaultEnvResponse({
      id: createId(),
      handle: createText("laravel"),
      onboarding_status: "completed",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
        environment: { href: "" },
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
        },
      }),
    ];

    server.use(
      ...stacksWithResources({
        accounts,
        apps,
      }),
    );

    const { TestProvider } = setupIntegrationTest({
      initEntries: [`/?accounts=${envExpress.id}`],
    });
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
    const resetBtn = await screen.findByText("Reset filters");
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
      onboarding_status: "initiated",
      _links: {
        stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
        environment: defaultHalHref(),
      },
    });
    const envLaravel = defaultEnvResponse({
      id: createId(),
      handle: createText("laravel"),
      onboarding_status: "completed",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
        environment: { href: "" },
      },
    });
    const envLegacy = defaultEnvResponse({
      id: createId(),
      handle: createText("legacy"),
      onboarding_status: "unknown",
      _links: {
        stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
        environment: { href: "" },
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
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: `${envLegacy.handle}-app`,
        _links: {
          account: defaultHalHref(`${testEnv.apiUrl}/accounts/${envLegacy.id}`),
          current_configuration: defaultHalHref(),
        },
      }),
    ];

    server.use(
      ...stacksWithResources({
        accounts,
        apps,
      }),
    );

    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <DeploymentsPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    expect(btn).toBeInTheDocument();
    expect(await screen.findByText(apps[0].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[1].handle)).toBeInTheDocument();
    expect(await screen.findByText(apps[2].handle)).toBeInTheDocument();
    expect(screen.queryByText(apps[3].handle)).not.toBeInTheDocument();
  });
});
