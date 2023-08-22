import { fireEvent, render, screen } from "@testing-library/react";

import {
  defaultOperationResponse,
  hasDeployEnvironment,
  selectEnvironmentById,
} from "@app/deploy";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEndpoint,
  testEnv,
  verifiedUserHandlers,
} from "@app/mocks";
import { appEndpointsUrl } from "@app/routes";
import {
  setupAppIntegrationTest,
  waitForBootup,
  waitForData,
  waitForToken,
} from "@app/test";
import { rest } from "msw";

describe("Create Endpoint flow", () => {
  describe("creating an aptible managed default https endpoint", () => {
    it("should provision successfully and navigate to endpoint detail page", async () => {
      server.use(
        ...stacksWithResources({
          apps: [testApp],
          accounts: [testAccount],
        }),
        ...verifiedUserHandlers(),
        rest.post(
          `${testEnv.apiUrl}/services/:serviceId/vhosts`,
          (_, res, ctx) => {
            return res(ctx.json(testEndpoint));
          },
        ),
        rest.post(
          `${testEnv.apiUrl}/vhosts/:endpointId/operations`,
          (_, res, ctx) => {
            return res(
              ctx.json(
                defaultOperationResponse({
                  id: createId(),
                  type: "provision",
                  status: "succeeded",
                }),
              ),
            );
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [appEndpointsUrl(`${testApp.id}`)],
      });

      await waitForBootup(store);
      await waitForToken(store);

      render(<App />);

      // we need to wait for accounts so we can do permission checks
      await waitForData(store, (state) => {
        return hasDeployEnvironment(
          selectEnvironmentById(state, { id: `${testAccount.id}` }),
        );
      });

      const addBtn = await screen.findByRole("button", {
        name: /New Endpoint/,
      });
      fireEvent.click(addBtn);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const typeRadio = await screen.findByRole("radio", {
        name: /default endpoint/,
      });
      fireEvent.click(typeRadio);

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(`Endpoint: ${testEndpoint.id}`);
    });
  });
});
