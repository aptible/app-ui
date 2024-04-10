import { defaultDatabaseResponse, defaultOperationResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testDatabaseOp,
  testDatabaseServiceId,
  testDestroyAccount,
  testDisk,
  testEnv,
  testPostgresDatabaseImage,
  verifiedUserHandlers,
} from "@app/mocks";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

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

    await waitForBootup(store);

    render(<App />);

    await screen.findByText(testAccount.handle);
    await screen.findByRole("button", { name: /Save/ });

    await screen.findByText(/postgres v14/);
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

  it("should not try to create a db without an imgId (e.g. user didnt pick a db yet)", async () => {
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

    await waitForBootup(store);

    render(<App />);

    await screen.findByText(testAccount.handle);

    const saveBtn = await screen.findByRole("button", {
      name: /Save/,
    });
    expect(saveBtn).toBeDisabled();
  });

  describe("when a duplicate db handle already exists in a different environment", () => {
    it.only("should create a new database and not try to re-provision that database", async () => {
      const dupeId = createId();
      const testDupeDatabaseOp = defaultOperationResponse({
        id: createId(),
        type: "provision",
        status: "succeeded",
        _links: {
          resource: defaultHalHref(`${testEnv.apiUrl}/databases/${dupeId}`),
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testDestroyAccount.id}`,
          ),
          code_scan_result: defaultHalHref(),
          self: defaultHalHref(),
          ssh_portal_connections: defaultHalHref(),
          ephemeral_sessions: defaultHalHref(),
          logs: defaultHalHref(),
          user: defaultHalHref(),
        },
      });
      const dupeDb = defaultDatabaseResponse({
        id: dupeId,
        handle: "example-postgres",
        type: "postgres",
        connection_url: "postgres://some:val@wow.com:5432",
        _embedded: {
          disk: testDisk,
          last_operation: testDupeDatabaseOp,
        },
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testDestroyAccount.id}`,
          ),
          initialize_from: defaultHalHref(),
          database_image: defaultHalHref(
            `${testEnv.apiUrl}/database_images/${testPostgresDatabaseImage.id}`,
          ),
          service: defaultHalHref(
            `${testEnv.apiUrl}/services/${testDatabaseServiceId}`,
          ),
          disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
        },
      });

      let counter = 0;
      server.use(
        ...stacksWithResources({
          accounts: [testAccount, testDestroyAccount],
          databases: [dupeDb],
        }),
        ...verifiedUserHandlers(),
        rest.post(
          `${testEnv.apiUrl}/databases/:id/operations`,
          async (_, res, ctx) => {
            return res(
              ctx.json({ _embedded: { operations: [testDatabaseOp] } }),
            );
          },
        ),
        rest.get(
          `${testEnv.apiUrl}/accounts/:envId/operations`,
          (_, res, ctx) => {
            counter += 1;
            const operations = counter === 1 ? [] : [testDatabaseOp];
            return res(
              ctx.json({
                _embedded: { operations },
              }),
            );
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [`/create/db?environment_id=${testAccount.id}`],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(testAccount.handle);
      await screen.findByRole("button", { name: /Save/ });

      await screen.findByText(/postgres v14/);
      const dbSelector = await screen.findByRole("combobox", {
        name: /new-db/,
      });
      await act(() => userEvent.selectOptions(dbSelector, "postgres v14"));
      const inp = await screen.findByRole("textbox", {
        name: "dbname",
      });
      await act(() => userEvent.clear(inp));
      await act(() => userEvent.type(inp, "example-postgres"));

      const saveBtn = await screen.findByRole("button", {
        name: /Save/,
      });

      // go to next page
      fireEvent.click(saveBtn);

      // if these two checks fail then that means that an existing database was
      // re-provisioned in a different environment
      await screen.findByText(/Operations show real-time/);
      await screen.findByText(/example-postgres/);
      expect(screen.queryByText(/example-postgres/)).toBeInTheDocument();
    });
  });
});
