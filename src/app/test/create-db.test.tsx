import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import {
  server,
  stacksWithResources,
  testAccount,
  testDatabaseOp,
  testEnv,
  verifiedUserHandlers,
} from "@app/mocks";
import { setupAppIntegrationTest, waitForEnv, waitForToken } from "@app/test";

describe("Create Database flow", () => {
  it("should successfully provision a database within an environment", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [],
      }),
      ...verifiedUserHandlers(),
      rest.post(
        `${testEnv.apiUrl}/databases/:id/operations`,
        async (_, res, ctx) => {
          return res(ctx.json(testDatabaseOp));
        },
      ),
      rest.get(
        `${testEnv.apiUrl}/accounts/:envId/operations`,
        (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: { operations: [] },
            }),
          );
        },
      ),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [`/create/db?environment_id=${testAccount.id}`],
    });

    render(<App />);

    await waitForToken(store);
    // we need to wait for accounts so we can do permission checks
    await waitForEnv(store, testAccount.id);

    await screen.findByText(testAccount.handle);
    await screen.findByRole("button", { name: /Save/ });

    const dbSelector = await screen.findByRole("combobox", {
      name: /new-db/,
    });
    await act(() => userEvent.selectOptions(dbSelector, "postgres v14"));

    const saveBtn = await screen.findByRole("button", {
      name: /Save/,
    });

    // go to next page
    fireEvent.click(saveBtn);

    await screen.findByText(/Operations show real-time/);
    expect(
      screen.queryByText(/test-account-1-.+-postgres/),
    ).toBeInTheDocument();
  });
});
