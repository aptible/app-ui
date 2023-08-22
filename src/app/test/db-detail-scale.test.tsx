import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAccount,
  testDatabasePostgres,
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
  waitForToken,
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
    await waitForToken(store);

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
    await act(async () => await userEvent.selectOptions(containerSize, "2048"));

    expect(btn).toBeEnabled();
    fireEvent.click(btn);

    expect(await screen.findByText("Operation Details")).toBeInTheDocument();
  });
});
