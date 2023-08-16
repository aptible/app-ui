import { act, fireEvent, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { hasDeployApp, selectAppById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { appServiceScalePathUrl } from "@app/routes";
import {
  setupAppIntegrationTest,
  waitForData,
  waitForEnv,
  waitForToken,
} from "@app/test";
import { rest } from "msw";

describe("AppDetailServiceScalePage", () => {
  it("should successfully show app service scale page happy path", async () => {
    server.use(
      ...verifiedUserHandlers(),
      ...stacksWithResources({ accounts: [testAccount], apps: [testApp] }),
      rest.get(`${testEnv.apiUrl}/operations/:id/logs`, (_, res, ctx) => {
        return res(ctx.text("/mock"));
      }),
      rest.get(`${testEnv.apiUrl}/mock`, (_, res, ctx) => {
        return res(ctx.text("complete"));
      }),
    );
    const { App, store } = setupAppIntegrationTest({
      initEntries: [
        appServiceScalePathUrl(`${testApp.id}`, `${testServiceRails.id}`),
      ],
    });

    render(<App />);

    await waitForToken(store);
    await waitForEnv(store, testAccount.id);
    await waitForData(store, (state) => {
      return hasDeployApp(selectAppById(state, { id: `${testApp.id}` }));
    });

    await screen.findByText(
      /Optimize container performance with a custom profile./,
    );
    const btn = await screen.findByRole("button", { name: /Save Changes/ });
    expect(btn).toBeDisabled();

    const containerCount = await screen.findByLabelText(/Number of Containers/);
    await act(async () => await userEvent.clear(containerCount));
    await act(async () => await userEvent.type(containerCount, "2"));

    const containerSize = await screen.findByLabelText(/Memory per Container/);
    await act(async () => await userEvent.selectOptions(containerSize, "2048"));

    expect(btn).toBeEnabled();
    fireEvent.click(btn);

    expect(await screen.findByText("Operation Details")).toBeInTheDocument();
  });
});
