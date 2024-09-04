import {
  hasDeployApp,
  hasDeployService,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testAutoscalingAccount,
  testAutoscalingApp,
  testAutoscalingPolicy,
  testAutoscalingPolicyHAS,
  testAutoscalingService,
  testAutoscalingStack,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { appServiceScalePathUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("AppDetailServiceScalePage", () => {
  it("should successfully show app service scale page happy path", async () => {
    let counter = 0;
    server.use(
      rest.get(`${testEnv.apiUrl}/services/:id`, (_, res, ctx) => {
        counter += 1;
        if (counter === 1) {
          return res(ctx.json(testServiceRails));
        }
        return res(
          ctx.json({
            ...testServiceRails,
            container_count: 2,
            container_memory_limit_mb: 2048,
          }),
        );
      }),
      rest.get(`${testEnv.apiUrl}/operations/:id/logs`, (_, res, ctx) => {
        return res(ctx.text("/mock"));
      }),
      rest.get(`${testEnv.apiUrl}/mock`, (_, res, ctx) => {
        return res(ctx.text("complete"));
      }),
      ...verifiedUserHandlers(),
      ...stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
        services: [testServiceRails],
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
    // get the second button
    const btn = (
      await screen.findAllByRole("button", { name: /Save Changes/ })
    )[1];
    expect(btn).toBeDisabled();

    // ensure VAS is diasabled
    const vasOption = screen.queryByRole("option", {
      name: "Enabled: Vertical Autoscaling",
    });
    expect(vasOption).toBeNull();

    // ensure HAS is enabled
    const hasOption = screen.queryByRole("option", {
      name: "Enabled: Horizontal Autoscaling",
    });
    expect(hasOption).toBeInTheDocument();

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

    // This is to prevent a regression where a use navigates back to the
    // scale page only to be immediately redirected to the activity page
    const serviceBtns = await screen.findAllByRole("link", {
      name: /Services/,
    });
    fireEvent.click(serviceBtns[1]);
    const scaleBtn = await screen.findAllByRole("link", { name: /Scale/ });
    fireEvent.click(scaleBtn[1]);
    await screen.findByText(/Last Scale/);
    expect(
      screen.queryByText(/Operations show real-time/),
    ).not.toBeInTheDocument();
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
      it("should validate some HAS inputs", async () => {
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

        await screen.findByRole("heading", { level: 1, name: "Autoscale" });

        const btns = screen.getAllByRole("button", {
          name: /Save Changes/,
        });
        const autoscaleBtn = btns[0];
        expect(autoscaleBtn).toBeDisabled();

        const autoscaleSelect = await screen.findByRole("combobox", {
          name: "Autoscaling Setting",
        });
        expect(autoscaleSelect).toHaveValue("disabled");

        fireEvent.change(autoscaleSelect, {
          target: { value: "horizontal" },
        });
        expect(autoscaleSelect).toHaveValue("horizontal");

        const minContainersInput = await screen.findByLabelText(
          "Minimum Container Count",
        );
        const maxContainersInput = await screen.findByLabelText(
          "Maximum Container Count",
        );
        const scaleDownInput = await screen.findByLabelText(
          "Scale Down Threshold (CPU Usage)",
        );
        const scaleUpInput = await screen.findByLabelText(
          "Scale Up Threshold (CPU Usage)",
        );

        // Check initial values
        expect(minContainersInput).toHaveValue(2);
        expect(maxContainersInput).toHaveValue(4);
        expect(scaleDownInput).toHaveValue(0.1);
        expect(scaleUpInput).toHaveValue(0.9);

        // Change the value to 1 should show a warning
        fireEvent.change(minContainersInput, { target: { value: 1 } });
        expect(minContainersInput).toHaveValue(1);
        await screen.findByText(
          "Warning: High-availability requires at least 2 containers",
        );

        // Max containers under min containers should be a validation failure
        fireEvent.change(minContainersInput, { target: { value: 5 } });

        expect(autoscaleBtn).toBeEnabled();
        fireEvent.click(autoscaleBtn);

        expect(autoscaleBtn).toBeEnabled();
        await screen.findByText(
          "Minimum containers must be less than maximum containers",
        );
        await screen.findByText(
          "Maximum containers must be above minimum containers",
        );

        expect(
          screen.queryByText(/Policy changes saved/),
        ).not.toBeInTheDocument();
      });

      describe("with an existing scaling policy on a service", () => {
        it("should show the current settings summary", async () => {
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

            rest.get(
              `${testEnv.apiUrl}/services/:id/service_sizing_policies`,
              async (_, res, ctx) => {
                return res(ctx.json(testAutoscalingPolicyHAS));
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
            return hasDeployService(
              selectServiceById(state, { id: `${testAutoscalingService.id}` }),
            );
          });

          const autoscaleSelect = await screen.findByRole("combobox", {
            name: "Autoscaling Setting",
          });
          screen.debug(autoscaleSelect);
          expect(autoscaleSelect).toHaveValue("horizontal");

          const title = await screen.findByText(/Current Settings/);
          const parent = title.closest("div");
          const expectedContent = `
          Minimum Containers:
               2
          Maximum Containers:
              4
          Scale Down CPU Threshold:
              0.1
          Scale Up CPU Threshold:
              0.9
          `;
          expect(parent).toHaveTextContent(expectedContent);
        });
      });

      describe("no existing scaling policy on a service", () => {
        it("should allow enabling horizontal autoscaling", async () => {
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

          await screen.findByRole("heading", { level: 1, name: "Autoscale" });

          const btns = screen.getAllByRole("button", {
            name: /Save Changes/,
          });
          const autoscaleBtn = btns[0];
          expect(autoscaleBtn).toBeDisabled();

          const autoscaleSelect = await screen.findByRole("combobox", {
            name: "Autoscaling Setting",
          });
          expect(autoscaleSelect).toHaveValue("disabled");

          fireEvent.change(autoscaleSelect, {
            target: { value: "horizontal" },
          });
          expect(autoscaleSelect).toHaveValue("horizontal");

          expect(autoscaleBtn).toBeEnabled();
          fireEvent.click(autoscaleBtn);

          expect(autoscaleBtn).toBeDisabled();

          await screen.findByText(/Policy changes saved/);
        });
      });

      it("should allow enabling vertical autoscaling", async () => {
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

        await screen.findByRole("heading", { level: 1, name: "Autoscale" });

        const btns = screen.getAllByRole("button", {
          name: /Save Changes/,
        });
        const autoscaleBtn = btns[0];
        expect(autoscaleBtn).toBeDisabled();

        const autoscaleSelect = await screen.findByRole("combobox", {
          name: "Autoscaling Setting",
        });
        expect(autoscaleSelect).toHaveValue("disabled");

        fireEvent.change(autoscaleSelect, {
          target: { value: "vertical" },
        });
        expect(autoscaleSelect).toHaveValue("vertical");

        expect(autoscaleBtn).toBeEnabled();
        fireEvent.click(autoscaleBtn);

        expect(autoscaleBtn).toBeDisabled();

        await screen.findByText(/Policy changes saved/);
      });
    });
  });
});
