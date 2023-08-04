import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAccount,
  testBackupRp,
} from "@app/mocks";
import { ENVIRONMENT_BACKUPS_PATH, environmentBackupsUrl } from "@app/routes";
import { setupIntegrationTest, waitForData, waitForToken } from "@app/test";

import { EnvironmentBackupsPage } from "./environment-detail-backups";
import { hasDeployBackupRp, selectBackupRpById } from "@app/deploy";

describe("EnvironmentBackupsPage", () => {
  it("should successfully show backup retention policy values", async () => {
    server.use(...stacksWithResources({ accounts: [testAccount] }));
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [environmentBackupsUrl(`${testAccount.id}`)],
      path: ENVIRONMENT_BACKUPS_PATH,
    });

    await waitForToken(store);

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

    const daily = await screen.findByLabelText(/Daily backups retained/);
    expect(daily.getAttribute("value")).toEqual("1");

    const monthly = await screen.findByLabelText(/Monthly backups retained/);
    expect(monthly.getAttribute("value")).toEqual("5");

    const radio = await screen.findAllByRole("radio", { name: /Yes/ });
    const makeCopy = radio[0];
    expect(makeCopy).not.toBeChecked();
    const keepFinal = radio[1];
    expect(keepFinal).toBeChecked();
  });

  it("should successfully edit backup retention policy values", async () => {
    server.use(...stacksWithResources({ accounts: [testAccount] }));
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [environmentBackupsUrl(`${testAccount.id}`)],
      path: ENVIRONMENT_BACKUPS_PATH,
    });

    await waitForToken(store);

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

    const daily = await screen.findByLabelText(/Daily backups retained/);
    await act(async () => await userEvent.type(daily, "5"));

    const monthly = await screen.findByLabelText(/Monthly backups retained/);
    await act(async () => await userEvent.type(monthly, "1"));

    const btn = await screen.findByRole("button", { name: /Save/ });
    fireEvent.click(btn);

    await screen.findByRole("button", { name: /Loading/ });
    await screen.findByRole("button", { name: /Save/ });

    const newDaily = await screen.findByLabelText(/Daily backups retained/);
    expect(newDaily).toHaveValue(15);

    const newMonthly = await screen.findByLabelText(/Monthly backups retained/);
    expect(newMonthly).toHaveValue(51);
  });
});
