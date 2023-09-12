import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { hasDeployEnvironment, selectEnvironmentById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testDatabaseElasticsearch,
  verifiedUserHandlers,
} from "@app/mocks";
import { createLogDrainUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";

describe("Create Log Drain flow", () => {
  it("should create eleasticsearch_database log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() =>
      userEvent.selectOptions(typeSelector, "Self-hosted Elasticsearch"),
    );

    const dbSelector = await screen.findByRole("combobox", {
      name: /db-selector/i,
    });
    await act(() =>
      userEvent.selectOptions(
        dbSelector,
        "elasticsearch-example (elasticsearch)",
      ),
    );

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create papertrail log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "Papertrail"));

    const host = await screen.findByRole("textbox", { name: /Host/i });
    await act(() => userEvent.type(host, "https://localhost:10000"));

    const port = await screen.findByLabelText(/Port/);
    fireEvent.change(port, { target: { value: 1000 } });

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create datadog log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "Datadog"));

    const host = await screen.findByRole("textbox", { name: /URL/i });
    await act(() => userEvent.type(host, "https://datadogmockurl"));

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create sumologic log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "Sumo Logic"));

    const host = await screen.findByRole("textbox", { name: /URL/i });
    await act(() => userEvent.type(host, "https://datadogmockurl"));

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create https_post log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "HTTPS POST"));

    const host = await screen.findByRole("textbox", { name: /URL/i });
    await act(() => userEvent.type(host, "https://datadogmockurl"));

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create syslog_tls_tcp log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "Syslog TLS TCP"));

    const host = await screen.findByRole("textbox", { name: /Host/i });
    await act(() => userEvent.type(host, "https://localhost:10000"));

    const port = await screen.findByLabelText(/Port/);
    fireEvent.change(port, { target: { value: 1000 } });

    const token = await screen.findByRole("textbox", { name: /Token/i });
    await act(() => userEvent.type(token, "secret token"));

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
  it("should create insightops log drain", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabaseElasticsearch],
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [createLogDrainUrl(`${testAccount.id}`)],
    });

    await waitForBootup(store);

    render(<App />);

    // we need to wait for accounts so we can do permission checks
    await waitForData(store, (state) => {
      return hasDeployEnvironment(
        selectEnvironmentById(state, { id: `${testAccount.id}` }),
      );
    });

    const btn = await screen.findByRole("button", {
      name: /Save Log Drain/,
    });

    const handle = await screen.findByRole("textbox", { name: /Handle/ });
    await act(() => userEvent.type(handle, "a-new-hope"));

    const typeSelector = await screen.findByRole("combobox", {
      name: /Type/,
    });
    await act(() => userEvent.selectOptions(typeSelector, "InsightOps"));

    const token = await screen.findByRole("textbox", { name: /Token/i });
    await act(() => userEvent.type(token, "secret token"));

    fireEvent.click(btn);

    await screen.findByText(/Operation:/);
    expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
  });
});
