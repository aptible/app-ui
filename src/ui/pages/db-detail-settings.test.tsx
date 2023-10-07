import { fireEvent, render, screen } from "@testing-library/react";

import { defaultDatabaseResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  server,
  stacksWithResources,
  testApp,
  testDatabaseId,
  testDatabaseOp,
  testDatabaseServiceId,
  testDestroyAccount,
  testDisk,
  testEnv,
  testPostgresDatabaseImage,
  verifiedUserHandlers,
} from "@app/mocks";
import { databaseSettingsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";

describe("DatabaseSettingsPage", () => {
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

      await fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(button).toBeEnabled();
    });
  });
});
