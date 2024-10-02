import { hasDeployBackupRp, selectBackupRpById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testAccountAdmin,
  testBackupRp,
} from "@app/mocks";
import { ENVIRONMENT_BACKUPS_PATH, environmentBackupsUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup, waitForData } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvironmentBackupsPage } from "./environment-detail-backups";

describe("EnvironmentBackupsPage", () => {
  it("should successfully show backup retention policy values", async () => {
    server.use(...stacksWithResources({ accounts: [testAccount] }));
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [environmentBackupsUrl(`${testAccount.id}`)],
      path: ENVIRONMENT_BACKUPS_PATH,
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <EnvironmentBackupsPage />
      </TestProvider>,
    );

    await screen.findByText(/Backup Retention Policy/);
    await waitForData(store, (state) => {
      return hasDeployBackupRp(
        selectBackupRpById(state, { id: `${testBackupRp.id}` }),
      );
    });

    await screen.findByText(/Daily backups retained/);
    await screen.findByText(/Monthly backups retained/);
    await screen.findByText(/Yearly backups retained/);
    await screen.findByText(/Copy backups to another region/);
    await screen.findByText(/Keep final backup for deprovisioned databases/);
  });

  it("should successfully edit backup retention policy values", async () => {
    server.use(...stacksWithResources({ accounts: [testAccountAdmin] }));
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [environmentBackupsUrl(`${testAccount.id}`)],
      path: ENVIRONMENT_BACKUPS_PATH,
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <EnvironmentBackupsPage />
      </TestProvider>,
    );

    await screen.findByText(/Backup Retention Policy/);
    await waitForData(store, (state) => {
      return hasDeployBackupRp(
        selectBackupRpById(state, { id: `${testBackupRp.id}` }),
      );
    });

    const edit = await screen.findByRole("button", {
      name: /Edit Policy/,
    });
    fireEvent.click(edit);

    const daily = await screen.findByLabelText(/Daily backups retained/);
    await act(async () => await userEvent.type(daily, "5"));

    const monthly = await screen.findByLabelText(/Monthly backups retained/);
    await act(async () => await userEvent.type(monthly, "1"));

    const btn = await screen.findByRole("button", { name: /Save Policy/ });
    fireEvent.click(btn);

    const newDaily = await screen.findByLabelText(/Daily backups retained/);
    expect(newDaily).toHaveValue(15);

    const newMonthly = await screen.findByLabelText(/Monthly backups retained/);
    expect(newMonthly).toHaveValue(51);
  });
});
