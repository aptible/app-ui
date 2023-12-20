import { act, fireEvent, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { hasDeployApp, selectAppById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testAutoscalingAccount,
  testAutoscalingApp,
  testAutoscalingPolicy,
  testAutoscalingService,
  testAutoscalingStack,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { appServiceScalePathUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
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

    await waitForBootup(store);

    render(<App />);
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

    expect(await screen.findByText("App Details")).toBeInTheDocument();
    expect(
      await screen.findByText(/Operations show real-time/),
    ).toBeInTheDocument();
  });

  describe("when changing container profile", () => {
    describe("and current memory limit is *less* than the new container profiles minimum memory requirements", () => {
      it("should indicate the change in the summary and update price accordingly", async () => {
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

        await waitForBootup(store);

        render(<App />);

        await waitForData(store, (state) => {
          return hasDeployApp(selectAppById(state, { id: `${testApp.id}` }));
        });

        await screen.findByText(
          /Optimize container performance with a custom profile./,
        );

        const profileSelector = await screen.findByRole("combobox", {
          name: /container-profile/,
        });
        await act(() =>
          userEvent.selectOptions(profileSelector, "Compute Optimized (C)"),
        );
        await screen.findByText(/Pending Changes/);

        expect(screen.getByLabelText(/Container Profile/)).toBeInTheDocument();
        expect(
          screen.getByText(
            /Changed from General Purpose \(M\) to Compute Optimized \(C\)/,
          ),
        ).toBeInTheDocument();
        expect(screen.getAllByText(/Container Size/)[0]).toBeInTheDocument();
        expect(
          screen.getByText(/Changed from 0.5 GB to 2 GB/),
        ).toBeInTheDocument();
      });
    });

    describe("when autoscaling is enabled", () => {
      describe("no existing scaling policy on a service", () => {
        it("should allow enabling autoscaling", async () => {
          server.use(
            ...verifiedUserHandlers(),
            ...stacksWithResources({
              stacks: [testAutoscalingStack],
              accounts: [testAutoscalingAccount],
              apps: [testAutoscalingApp],
            }),
            rest.get(`${testEnv.apiUrl}/operations/:id/logs`, (_, res, ctx) => {
              return res(ctx.text("/mock"));
            }),
            rest.get(`${testEnv.apiUrl}/mock`, (_, res, ctx) => {
              return res(ctx.text("complete"));
            }),

            rest.post(
              `${testEnv.apiUrl}/services/:id/service_sizing_policies`,
              async (_, res, ctx) => {
                return res(ctx.json(testAutoscalingPolicy));
              },
            ),
          );
          const { App, store } = setupAppIntegrationTest({
            initEntries: [
              appServiceScalePathUrl(
                `${testAutoscalingApp.id}`,
                `${testAutoscalingService.id}`,
              ),
            ],
          });

          await waitForBootup(store);

          render(<App />);

          await waitForData(store, (state) => {
            return hasDeployApp(
              selectAppById(state, { id: `${testAutoscalingApp.id}` }),
            );
          });

          await screen.findByText(
            /Automatically scale your services by regularly revieweing recent CPU and RAM/,
          );

          const btns = screen.getAllByRole("button", {
            name: /Save Changes/,
          });
          const autoscaleBtn = btns[0];
          expect(autoscaleBtn).toBeDisabled();

          const cmdDisabledRadio = await screen.findByRole("radio", {
            name: /Disabled/,
          });
          expect(cmdDisabledRadio).toBeChecked();

          const cmdEnabledRadio = await screen.findByRole("radio", {
            name: /Enabled/,
          });
          fireEvent.click(cmdEnabledRadio);

          expect(autoscaleBtn).toBeEnabled();
          fireEvent.click(autoscaleBtn);

          expect(autoscaleBtn).toBeDisabled();
        });
      });
    });
  });
});
