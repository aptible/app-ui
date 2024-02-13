import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
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

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "default"));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(`ID: ${testEndpoint.id}`);
    });
  });
});
