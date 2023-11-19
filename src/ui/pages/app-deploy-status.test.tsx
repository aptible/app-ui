import {
  defaultAppResponse,
  defaultEndpointResponse,
  defaultOperationResponse,
} from "@app/deploy";
import { defaultLoadingItem } from "@app/fx";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testConfiguration,
  testEnv,
  testServiceRails,
} from "@app/mocks";
import { deployProject } from "@app/projects";
import { APP_DEPLOY_STATUS_PATH, appDeployStatusUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { rest } from "msw";
import { AppDeployStatusPage } from "./app-deploy-status";

describe("AppDeployStatusPage", () => {
  describe("when app deployed and no vhost provisioned yet", () => {
    it("should let the user create a vhost", async () => {
      const handlers = stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
      });
      server.use(...handlers);

      const { store, TestProvider } = setupIntegrationTest({
        path: APP_DEPLOY_STATUS_PATH,
        initEntries: [appDeployStatusUrl(`${testApp.id}`)],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppDeployStatusPage />
        </TestProvider>,
      );

      const txt = await screen.findByText(/Which service needs an/);
      expect(txt).toBeInTheDocument();
      const btn = await screen.findByRole("button", {
        name: "Create Endpoint",
      });
      expect(btn).toBeInTheDocument();
      const vhostSelector = await screen.findAllByRole("radio");
      fireEvent.click(vhostSelector[0]);
      fireEvent.click(btn);

      const op = await screen.findByText("HTTPS endpoint provision");
      expect(op).toBeInTheDocument();
    });
  });

  describe("when app deploy and vhost provisioned already", () => {
    it("should show vhosts and a link to manage them", async () => {
      const handlers = stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
      });
      server.use(
        ...handlers,
        rest.get(`${testEnv.apiUrl}/apps/:id/vhosts`, (_, res, ctx) => {
          const jso = {
            _embedded: {
              vhosts: [
                defaultEndpointResponse({
                  id: createId(),
                  virtual_domain: "https://some.url",
                  _links: {
                    service: defaultHalHref(
                      `${testEnv.apiUrl}/services/${testServiceRails.id}`,
                    ),
                    certificate: defaultHalHref(),
                  },
                }),
              ],
            },
          };
          return res(ctx.json(jso));
        }),
      );

      const { store, TestProvider } = setupIntegrationTest({
        path: APP_DEPLOY_STATUS_PATH,
        initEntries: [appDeployStatusUrl(`${testApp.id}`)],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppDeployStatusPage />
        </TestProvider>,
      );

      const txt = await screen.findByText("Current Endpoints");
      expect(txt).toBeInTheDocument();
      const service = await screen.findByText(testServiceRails.command);
      expect(service).toBeInTheDocument();
      const link = await screen.findByRole("link", {
        name: "Manage Endpoints",
      });
      expect(link).toBeInTheDocument();
    });
  });

  describe("when there is a deploy error", () => {
    it("should display the error and when redeployed should hide error", async () => {
      const appId = testApp.id;
      const app = defaultAppResponse({
        id: appId,
        handle: `${testAccount.handle}-app`,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
          current_configuration: defaultHalHref(
            `${testEnv.apiUrl}/configurations/${testConfiguration.id}`,
          ),
          current_image: defaultHalHref(),
        },
        _embedded: {
          services: [testServiceRails],
          current_image: null,
          last_operation: null,
          last_deploy_operation: defaultOperationResponse({
            id: createId(),
            type: "deploy",
            status: "failed",
            updated_at: new Date("2023-04-08T14:00:00.0000").toISOString(),
            _links: {
              resource: defaultHalHref(`${testEnv.apiUrl}/apps/${appId}`),
              account: defaultHalHref(
                `${testEnv.apiUrl}/accounts/${testAccount.id}`,
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

      const handlers = stacksWithResources({
        accounts: [testAccount],
        apps: [app],
      });
      server.use(...handlers);

      const { TestProvider, store } = setupIntegrationTest({
        path: APP_DEPLOY_STATUS_PATH,
        initEntries: [appDeployStatusUrl(`${app.id}`)],
        initState: {
          "@@starfx/loaders": {
            [`${deployProject}`]: defaultLoadingItem({
              status: "error",
              message: "Plan limit exceeded",
            }),
          },
        },
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppDeployStatusPage />
        </TestProvider>,
      );

      await screen.findByText("Plan limit exceeded");
      const btn = await screen.findByRole("button", { name: "Redeploy" });
      fireEvent.click(btn);

      await waitForElementToBeRemoved(() =>
        screen.queryByText(/Check the error logs and make changes/),
      );
      await screen.findByText(/App deployment/);
      await screen.findAllByText(/DONE/);
      expect(screen.queryByText("Plan limit exceeded")).not.toBeInTheDocument();
    });
  });
});
