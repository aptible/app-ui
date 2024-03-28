import { defaultAppResponse, defaultOperationResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testEnv,
  verifiedUserHandlers,
} from "@app/mocks";
import { appDeployResumeUrl } from "@app/routes";
import { setupAppIntegrationTest } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("CreateProjectFromAppSetupPage", () => {
  describe("when there are no operations", () => {
    it("should redirect to getting started page", async () => {
      const app = defaultAppResponse({
        id: createId(),
        handle: testAccount.handle,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
          current_deployment: defaultHalHref(),
          current_source: defaultHalHref(),
        },
      });

      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [app],
        }),
      );

      const { App } = setupAppIntegrationTest({
        initEntries: [appDeployResumeUrl(`${app.id}`)],
      });

      render(<App />);

      const txt = await screen.findByText(/Deploy with Git Push/);
      expect(txt).toBeInTheDocument();
    });
  });

  describe("when there is just an app configure operation", () => {
    it("should redirect to status page", async () => {
      const app = defaultAppResponse({
        id: createId(),
        handle: testAccount.handle,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
          current_deployment: defaultHalHref(),
          current_source: defaultHalHref(),
        },
      });
      const op = defaultOperationResponse({
        id: createId(),
        type: "configure",
        status: "succeeded",
        _links: {
          code_scan_result: defaultHalHref(),
          resource: {
            href: `${testEnv.apiUrl}/apps/${app.id}`,
          },
          ephemeral_sessions: defaultHalHref(),
          self: defaultHalHref(),
          account: app._links.account,
          ssh_portal_connections: defaultHalHref(),
          user: defaultHalHref(),
          logs: defaultHalHref(),
        },
      });

      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [app],
        }),
        rest.get(`${testEnv.apiUrl}/apps/:id/operations`, (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: {
                operations: [op],
              },
            }),
          );
        }),
      );

      const { App } = setupAppIntegrationTest({
        initEntries: [appDeployResumeUrl(`${app.id}`)],
      });

      render(<App />);

      const txt = await screen.findByText("Deployed your Code");
      expect(txt).toBeInTheDocument();
    });
  });
});
