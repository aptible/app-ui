import { defaultCodeScanResponse } from "@app/deploy";
import {
  createId,
  server,
  stacksWithResources,
  testApp,
  testDatabasePostgres,
  testEnv,
} from "@app/mocks";
import { APP_DEPLOY_CONFIGURE_PATH, appDeployConfigureUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { AppDeployConfigurePage } from "./app-deploy-configure";

describe("AppDeployConfigurePage", () => {
  it("should render settings from url query param", async () => {
    const handlers = stacksWithResources({ apps: [testApp] });
    server.use(...handlers);

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [
        appDeployConfigureUrl(
          `${testApp.id}`,
          "dbs=database_url:postgres:14&envs=DEBUG:1,APP",
        ),
      ],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    const envTxtArea = await screen.findByLabelText("Environment Variables");
    expect(envTxtArea.textContent).toBe("DEBUG=1\nAPP=");
    await screen.findByText("postgres v14");
  });

  it("should *not* render 'Connect Existing Database' button when no existing dbs exist", async () => {
    const handlers = stacksWithResources({ apps: [testApp] });
    server.use(...handlers);

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [appDeployConfigureUrl(`${testApp.id}`)],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    await screen.findByText(/Loading databases.../);
    const btn = screen.queryByRole("button", {
      name: /Connect Existing Database/,
    });
    expect(btn).not.toBeInTheDocument();
  });

  it("should display error when validating database environment variables", async () => {
    const handlers = stacksWithResources({
      apps: [testApp],
    });
    server.use(...handlers);

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [
        appDeployConfigureUrl(
          `${testApp.id}`,
          "dbs=database_url:postgres:14,database_url:redis:5&envs=DEBUG:1,APP",
        ),
      ],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    const envTxtArea = await screen.findByLabelText("Environment Variables");
    expect(envTxtArea.textContent).toBe("DEBUG=1\nAPP=");
    await screen.findAllByText("postgres v14");

    const btn = await screen.findByRole("button", { name: "Save & Deploy" });
    fireEvent.click(btn);

    const text = await screen.findByText(
      /DATABASE_URL has already been used, each database env var must be unique/,
    );
    expect(text).toBeInTheDocument();
  });

  it("should display error when validating database environment variables for new and existing dbs", async () => {
    const handlers = stacksWithResources({
      apps: [testApp],
      databases: [testDatabasePostgres],
    });
    server.use(...handlers);

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [
        appDeployConfigureUrl(`${testApp.id}`, "dbs=database_url:postgres:14"),
      ],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    await screen.findAllByText("postgres v14");

    const existingDb = await screen.findByRole("button", {
      name: /Connect Existing Database/,
    });
    fireEvent.click(existingDb);

    const dbSelector = await screen.findByRole("combobox", {
      name: /existing-db/,
    });
    await act(() =>
      userEvent.selectOptions(dbSelector, "test-app-1-postgres (postgres)"),
    );

    const btn = await screen.findByRole("button", { name: "Save & Deploy" });
    fireEvent.click(btn);

    const text = await screen.findByText(
      /DATABASE_URL has already been used, each database env var must be unique/,
    );
    expect(text).toBeInTheDocument();
  });

  it("should display code scan banners (dockerfile and procfile detected)", async () => {
    const codeScan = defaultCodeScanResponse({
      id: createId(),
      dockerfile_present: true,
      procfile_present: true,
      _links: {
        app: { href: `${testEnv.apiUrl}/apps/${testApp.id}` },
        operation: { href: "" },
      },
    });
    const handlers = stacksWithResources({ apps: [testApp] });
    server.use(
      ...handlers,
      rest.get(`${testEnv.apiUrl}/code_scan_results/:id`, (_, res, ctx) => {
        return res(ctx.json(codeScan));
      }),
    );

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [appDeployConfigureUrl(`${testApp.id}`)],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    await screen.findAllByText(/Your code has a/);
    const banner = await screen.findAllByRole("status");
    expect(banner[0].textContent).toMatch(/Your code has a Dockerfile/);
    expect(banner[1].textContent).toMatch(/This UI uses dotenv/);
    expect(banner[2].textContent).toMatch(/Your code has a Procfile/);
  });

  it("should filter out new databases without an imgId", async () => {
    const handlers = stacksWithResources({
      apps: [testApp],
    });
    server.use(...handlers);

    const { TestProvider, store } = setupIntegrationTest({
      path: APP_DEPLOY_CONFIGURE_PATH,
      initEntries: [appDeployConfigureUrl(`${testApp.id}`)],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <AppDeployConfigurePage />
      </TestProvider>,
    );

    const newDbBtn = await screen.findByRole("button", {
      name: /New Database/,
    });
    fireEvent.click(newDbBtn);

    const btn = await screen.findByRole("button", { name: "Save & Deploy" });
    fireEvent.click(btn);

    const text = await screen.findByText(
      /Must pick a database or delete the selector from the menu/,
    );
    expect(text).toBeInTheDocument();
  });
});
