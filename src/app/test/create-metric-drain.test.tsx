import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { hasDeployEnvironment, selectEnvironmentById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  testDatabaseInfluxdb,
  verifiedUserHandlers,
} from "@app/mocks";
import { createMetricDrainUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForData, waitForToken } from "@app/test";

describe("Create Metric Drain flow", () => {
  describe("creating a datadog metric drain", () => {
    it("should provision successfully and navigate to operation detail page", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [createMetricDrainUrl(`${testAccount.id}`)],
      });

      render(<App />);

      await waitForToken(store);
      // we need to wait for accounts so we can do permission checks
      await waitForData(store, (state) => {
        return hasDeployEnvironment(
          selectEnvironmentById(state, { id: `${testAccount.id}` }),
        );
      });

      const handle = await screen.findByRole("textbox", { name: /Handle/ });
      await act(() => userEvent.type(handle, "a-new-hope"));

      const typeSelector = await screen.findByRole("combobox", {
        name: /Type/,
      });
      await act(() => userEvent.selectOptions(typeSelector, "Datadog"));

      const apiKey = await screen.findByRole("textbox", { name: /API Key/ });
      await act(() => userEvent.type(apiKey, "some-api-key"));

      const btn = await screen.findByRole("button", {
        name: /Save Metric Drain/,
      });
      fireEvent.click(btn);

      await screen.findByText(/Operation:/);
      expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
    });
  });

  describe("creating a influxdb_database metric drain", () => {
    it("should provision successfully and navigate to operation detail page", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
          databases: [testDatabaseInfluxdb],
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [createMetricDrainUrl(`${testAccount.id}`)],
      });

      render(<App />);

      await waitForToken(store);
      // we need to wait for accounts so we can do permission checks
      await waitForData(store, (state) => {
        return hasDeployEnvironment(
          selectEnvironmentById(state, { id: `${testAccount.id}` }),
        );
      });

      const handle = await screen.findByRole("textbox", { name: /Handle/ });
      await act(() => userEvent.type(handle, "a-new-hope"));

      const typeSelector = await screen.findByRole("combobox", {
        name: /Type/,
      });
      await act(() =>
        userEvent.selectOptions(typeSelector, "InfluxDb (this environment)"),
      );

      const dbSelector = await screen.findByRole("combobox", {
        name: /db-selector/,
      });
      await act(() =>
        userEvent.selectOptions(dbSelector, "influxdb-example (influxdb)"),
      );

      const btn = await screen.findByRole("button", {
        name: /Save Metric Drain/,
      });
      fireEvent.click(btn);

      await screen.findByText(/Operation:/);
      expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
    });
  });

  describe("creating a influxdb metric drain", () => {
    it("should provision successfully and navigate to operation detail page", async () => {
      server.use(
        ...stacksWithResources({
          accounts: [testAccount],
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [createMetricDrainUrl(`${testAccount.id}`)],
      });

      render(<App />);

      await waitForToken(store);
      // we need to wait for accounts so we can do permission checks
      await waitForData(store, (state) => {
        return hasDeployEnvironment(
          selectEnvironmentById(state, { id: `${testAccount.id}` }),
        );
      });

      const handle = await screen.findByRole("textbox", { name: /Handle/ });
      await act(() => userEvent.type(handle, "a-new-hope"));

      const typeSelector = await screen.findByRole("combobox", {
        name: /Type/,
      });
      await act(() =>
        userEvent.selectOptions(typeSelector, "InfluxDb (anywhere)"),
      );

      const hostname = await screen.findByRole("textbox", { name: /Hostname/ });
      await act(() => userEvent.type(hostname, "some-url.com"));

      const username = await screen.findByRole("textbox", { name: /Username/ });
      await act(() => userEvent.type(username, "niceguy"));

      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "hunter1"));

      const db = await screen.findByRole("textbox", { name: /Database/ });
      await act(() => userEvent.type(db, "leetdb"));

      const btn = await screen.findByRole("button", {
        name: /Save Metric Drain/,
      });
      fireEvent.click(btn);

      await screen.findByText(/Operation:/);
      expect(screen.queryByText(/Operation:/)).toBeInTheDocument();
    });
  });
});
