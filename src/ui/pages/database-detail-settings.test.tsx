import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { defaultDatabaseResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testDatabaseId,
  testDatabaseOp,
  testDatabasePostgres,
  testDatabaseServiceId,
  testDestroyAccount,
  testDisk,
  testEnv,
  testPostgresDatabaseImage,
  verifiedUserHandlers,
} from "@app/mocks";
import { databaseSettingsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { rest } from "msw";

describe("DatabaseSettingsPage", () => {
  describe("when the user wants to deprovision a database", () => {
    it("should let the user deprovision", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
          databases: [testDatabasePostgres],
        }),
        ...verifiedUserHandlers(),
      );

      const { store, App } = setupAppIntegrationTest({
        initEntries: [databaseSettingsUrl(`${testDatabasePostgres.id}`)],
      });

      await waitForBootup(store);

      render(<App />);

      const inp = await screen.findByRole("textbox", {
        name: /delete-confirm/,
      });
      await act(() => userEvent.type(inp, "test-app-1-postgres"));

      const btn = await screen.findByRole("button", {
        name: /Deprovision Database/,
      });
      // toBeEnabled() does not work here for some reason
      expect(btn.getAttribute("disabled")).toBeFalsy();
    });

    describe("when there is an associated replica", () => {
      it("should not let the user deprovision", async () => {
        const testDatabasePostgresReplica = defaultDatabaseResponse({
          id: createId(),
          handle: "postgres-replica",
          type: "postgres",
          connection_url: "postgres://some:val@wow.com:5432",
          _embedded: {
            disk: testDisk,
            last_operation: testDatabaseOp,
          },
          _links: {
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${testAccount.id}`,
            ),
            initialize_from: defaultHalHref(
              `${testEnv.apiUrl}/database/${testDatabasePostgres.id}`,
            ),
            database_image: defaultHalHref(
              `${testEnv.apiUrl}/database_images/${testPostgresDatabaseImage.id}`,
            ),
            service: defaultHalHref(
              `${testEnv.apiUrl}/services/${testDatabaseServiceId}`,
            ),
            disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
          },
        });

        server.use(
          ...stacksWithResources({
            accounts: [testAccount],
            databases: [testDatabasePostgres],
          }),
          ...verifiedUserHandlers(),
          rest.get(
            `${testEnv.apiUrl}/databases/:id/dependents`,
            async (_, res, ctx) => {
              return res(
                ctx.json({
                  _embedded: { databases: [testDatabasePostgresReplica] },
                }),
              );
            },
          ),
        );

        const { store, App } = setupAppIntegrationTest({
          initEntries: [databaseSettingsUrl(`${testDatabasePostgres.id}`)],
        });

        await waitForBootup(store);

        render(<App />);

        await screen.findByText(/These other databases depend on/);

        const inp = await screen.findByRole("textbox", {
          name: /delete-confirm/,
        });
        await act(() => userEvent.type(inp, "test-app-1-postgres"));

        const btn = await screen.findByRole("button", {
          name: /Deprovision Database/,
        });
        expect(btn).toBeDisabled();
      });
    });
  });

  describe("when the user acks the warning about downtime", () => {
    it("should allow a restart with backup and restore", async () => {
      // This is similar to the testDatabasePostgres in @app/mocks except it's in
      // the testDestroyAccount account.
      const testDatabasePostgres = defaultDatabaseResponse({
        id: testDatabaseId,
        handle: `${testApp.handle}-postgres`,
        type: "postgres",
        connection_url: "postgres://some:val@wow.com:5432",
        _embedded: {
          disk: testDisk,
          last_operation: testDatabaseOp,
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

      server.use(
        ...stacksWithResources({
          accounts: [testDestroyAccount],
          databases: [testDatabasePostgres],
        }),
        ...verifiedUserHandlers(),
      );

      const { store, App } = setupAppIntegrationTest({
        initEntries: [databaseSettingsUrl(`${testDatabasePostgres.id}`)],
      });

      await waitForBootup(store);

      render(<App />);

      // Sanity check to make sure our testDestroyAccount permissions work.
      expect(
        screen.queryByText(/You do not have "Destroy" permissions/),
      ).not.toBeInTheDocument();

      const button = await screen.findByRole("button", {
        name: /Restart Database with Disk Backup and Restore/,
      });
      expect(button).toBeDisabled();

      const checkbox = await screen.findByRole("checkbox", {
        name: /I understand the warning above/,
      });
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(button).toBeEnabled();
    });
  });

  describe("when the database is a replica", () => {
    it("should let the user unlink the replica", async () => {
      const testDatabasePostgresReplica = defaultDatabaseResponse({
        id: createId(),
        handle: "postgres-replica",
        type: "postgres",
        connection_url: "postgres://some:val@wow.com:5432",
        _embedded: {
          disk: testDisk,
          last_operation: testDatabaseOp,
        },
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testDestroyAccount.id}`,
          ),
          initialize_from: defaultHalHref(
            `${testEnv.apiUrl}/databases/${testDatabasePostgres.id}`,
          ),
          database_image: defaultHalHref(
            `${testEnv.apiUrl}/database_images/${testPostgresDatabaseImage.id}`,
          ),
          service: defaultHalHref(
            `${testEnv.apiUrl}/services/${testDatabaseServiceId}`,
          ),
          disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
        },
      });

      server.use(
        ...stacksWithResources({
          accounts: [testDestroyAccount],
          databases: [testDatabasePostgresReplica],
        }),
        ...verifiedUserHandlers(),
      );

      const { store, App } = setupAppIntegrationTest({
        initEntries: [databaseSettingsUrl(`${testDatabasePostgresReplica.id}`)],
      });

      await waitForBootup(store);

      render(<App />);

      expect(
        screen.queryByText(/You do not have "Destroy" permissions/),
      ).not.toBeInTheDocument();

      // Check for unlink text
      const unlinkText = await screen.findByText(
        /You are about to unlink a replica from its primary. To proceed, type/,
      );
      expect(unlinkText).toBeInTheDocument();

      const inp = await screen.findByRole("textbox", {
        name: /unlink-confirm/,
      });
      await act(() => userEvent.type(inp, "postgres-replica"));

      // Check for button with correct text
      const unlinkButton = await screen.findByRole("button", {
        name: /Unlink Replica from Source/,
      });
      expect(unlinkButton).toBeInTheDocument();
      expect(unlinkButton.getAttribute("disabled")).toBeFalsy();
    });
  });

  describe("when the database is not a replica", () => {
    it("should not display the option to unlink", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
          databases: [testDatabasePostgres],
        }),
        ...verifiedUserHandlers(),
      );

      const { store, App } = setupAppIntegrationTest({
        initEntries: [databaseSettingsUrl(`${testDatabasePostgres.id}`)],
      });

      await waitForBootup(store);

      render(<App />);

      // Check that the promotion text is not displayed
      expect(
        screen.queryByText(
          /You are about to unlink a replica from its primary. To proceed, type/,
        ),
      ).not.toBeInTheDocument();

      // Check that the button is not displayed
      expect(
        screen.queryByRole("button", {
          name: /Unlink Replica from Source/,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
