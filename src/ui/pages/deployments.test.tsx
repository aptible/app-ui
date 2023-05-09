import { render, screen } from "@testing-library/react";

import { DeploymentsPage } from "./create-project-git";
import { defaultAppResponse, defaultEnvResponse } from "@app/deploy";
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
  it("should show a list of apps for accounts with onboarding status", async () => {
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
        handle: envExpress.handle,
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
        handle: envLaravel.handle,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${envLaravel.id}`,
          ),
          current_configuration: defaultHalHref(),
        },
      }),
      defaultAppResponse({
        id: createId(),
        handle: envLegacy.handle,
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

    const { TestProvider } = setupIntegrationTest("/");
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
