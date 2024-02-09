import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAccount,
  testDatabasePostgres,
  testDisk,
  testEnv,
  testServicePostgres,
  verifiedUserHandlers,
} from "@app/mocks";
import { databaseScaleUrl } from "@app/routes";
import {
  setupAppIntegrationTest,
  waitForBootup,
  waitForData,
  waitForEnv,
} from "@app/test";

import {
  hasDeployDatabase,
  hasDeployService,
  selectDatabaseById,
  selectServiceById,
} from "@app/deploy";
import { rest } from "msw";

describe("DatabaseScalePage", () => {
  it("should successfully show database scale page happy path", async () => {
    let counterService = 0;
    let counterDisk = 0;

    server.use(
      rest.get(`${testEnv.apiUrl}/services/:id`, (_, res, ctx) => {
        counterService += 1;
        if (counterService === 1) {
          return res(ctx.json(testServicePostgres));
        }
        return res(
          ctx.json({ ...testServicePostgres, container_memory_limit_mb: 2048 }),
        );
      }),
      rest.get(`${testEnv.apiUrl}/disks/:id`, async (_, res, ctx) => {
        counterDisk += 1;
        if (counterDisk <= 2) {
          return res(ctx.json(testDisk));
        }
        return res(ctx.json({ ...testDisk, size: 20 }));
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
        databases: [testDatabasePostgres],
        services: [],
      }),
    );
    const { App, store } = setupAppIntegrationTest({
      initEntries: [databaseScaleUrl(`${testDatabasePostgres.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    await waitForEnv(store, testAccount.id);
    await waitForData(store, (state) => {
      return hasDeployDatabase(
        selectDatabaseById(state, { id: `${testDatabasePostgres.id}` }),
      );
    });
    await waitForData(store, (state) => {
      return hasDeployService(
        selectServiceById(state, { id: `${testServicePostgres.id}` }),
      );
    });

    await screen.findByText(
      /Optimize container performance with a custom profile./,
    );
    const btn = await screen.findByRole("button", { name: /Save Changes/ });
    expect(btn).toBeDisabled();

    const diskSize = await screen.findByLabelText(/Disk Size/);
    fireEvent.change(diskSize, { target: { value: 20 } });

    const containerSize = await screen.findByLabelText(/Memory per Container/);
    await act(() => userEvent.selectOptions(containerSize, "2048"));

    expect(btn).toBeEnabled();
    fireEvent.click(btn);

    expect(await screen.findByText("Database Details")).toBeInTheDocument();
    expect(
      await screen.findByText(/Operations show real-time/),
    ).toBeInTheDocument();

    // This is to prevent a regression where a use navigates back to the
    // scale page only to be immediately redirected to the activity page
    const scaleBtn = await screen.findByRole("link", { name: /Scale/ });
    fireEvent.click(scaleBtn);
    const cs = await screen.findByLabelText(/Memory per Container/);
    expect(cs).toHaveValue("2048");
    const ds = await screen.findByLabelText(/Disk Size/);
    expect(ds).toHaveValue(20);
    expect(
      screen.queryByText(/Operations show real-time/),
    ).not.toBeInTheDocument();
  });

  describe("when changing container profile", () => {
    describe("and current memory limit is *less* than the new container profiles minimum memory requirements", () => {
      it("should indicate the change in the summary and update price accordingly", async () => {
        server.use(
          ...verifiedUserHandlers(),
          ...stacksWithResources({
            accounts: [testAccount],
            databases: [testDatabasePostgres],
            services: [testServicePostgres],
          }),
          rest.get(`${testEnv.apiUrl}/operations/:id/logs`, (_, res, ctx) => {
            return res(ctx.text("/mock"));
          }),
          rest.get(`${testEnv.apiUrl}/mock`, (_, res, ctx) => {
            return res(ctx.text("complete"));
          }),
        );
        const { App, store } = setupAppIntegrationTest({
          initEntries: [databaseScaleUrl(`${testDatabasePostgres.id}`)],
        });

        await waitForBootup(store);

        render(<App />);

        await waitForEnv(store, testAccount.id);
        await waitForData(store, (state) => {
          return hasDeployDatabase(
            selectDatabaseById(state, { id: `${testDatabasePostgres.id}` }),
          );
        });
        await waitForData(store, (state) => {
          return hasDeployService(
            selectServiceById(state, { id: `${testServicePostgres.id}` }),
          );
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
        expect(screen.getByText(/Container Size/)).toBeInTheDocument();
        expect(
          screen.getByText(/Changed from 0.5 GB to 2 GB/),
        ).toBeInTheDocument();
      });
    });
  });
});
