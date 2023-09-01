import { render, screen } from "@testing-library/react";

import { defaultAppResponse, defaultOperationResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testEnv,
} from "@app/mocks";
import { createProjectGitAppSetupUrl } from "@app/routes";
import { setupAppIntegrationTest } from "@app/test";
import { rest } from "msw";

describe("CreateProjectFromAppSetupPage", () => {
  describe("when there are no operations", () => {
    it("should redirect to code push page", async () => {
      const app = defaultAppResponse({
        id: createId(),
        handle: testAccount.handle,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      });

      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [app],
        }),
      );

      const { App } = setupAppIntegrationTest({
        initEntries: [createProjectGitAppSetupUrl(`${app.id}`)],
      });

      render(<App />);

      const txt = await screen.findByText("Push your code to Aptible");
      expect(txt).toBeInTheDocument();
    });
  });

  describe("when there is just a scan operation", () => {
    it("should redirect to settings page", async () => {
      const app = defaultAppResponse({
        id: createId(),
        handle: testAccount.handle,
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
          current_configuration: defaultHalHref(),
          current_image: defaultHalHref(),
        },
      });
      const scanOp = defaultOperationResponse({
        id: createId(),
        type: "scan_code",
        status: "succeeded",
        _links: {
          code_scan_result: {
            href: `${testEnv.apiUrl}/code_scan_results/${createId()}`,
          },
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
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [app],
        }),
        rest.get(`${testEnv.apiUrl}/apps/:id/operations`, (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: {
                operations: [scanOp],
              },
            }),
          );
        }),
      );

      const { App } = setupAppIntegrationTest({
        initEntries: [createProjectGitAppSetupUrl(`${app.id}`)],
      });

      render(<App />);

      const txt = await screen.findByText("Configure your App");
      expect(txt).toBeInTheDocument();
    });
  });

  describe("when there is just an app deploy operation", () => {
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
        },
      });
      const op = defaultOperationResponse({
        id: createId(),
        type: "deploy",
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
        initEntries: [createProjectGitAppSetupUrl(`${app.id}`)],
      });

      render(<App />);

      const txt = await screen.findByText("Deployed your Code");
      expect(txt).toBeInTheDocument();
    });
  });
});
