import { loginUrl } from "@app/routes";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAppDeployed,
  testEmail,
  testEnv,
  testEnvExpress,
} from "@app/mocks";
import { setupAppIntegrationTest, setupIntegrationTest } from "@app/test";

import { LoginPage } from "./login";
import { rest } from "msw";

describe("Login page", () => {
  it("the log in button is visible", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button");
    expect(el.textContent).toEqual("Log In");
  });

  describe("after successful login", () => {
    it("should fetch initial data", async () => {
      const { App } = setupAppIntegrationTest({ initEntries: [loginUrl()] });
      render(<App />);

      server.use(
        ...stacksWithResources({
          accounts: [testEnvExpress],
          apps: [testAppDeployed],
        }),
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
      );

      const email = await screen.findByRole("textbox", { name: "email" });
      await act(async () => {
        await userEvent.type(email, testEmail);
      });
      const pass = await screen.findByLabelText("Password");
      await act(async () => {
        await userEvent.type(pass, "1234");
      });
      const btn = await screen.findByRole("button");
      fireEvent.click(btn);

      await screen.findByText("Deployments");
      expect(
        await screen.findByText(testAppDeployed.handle),
      ).toBeInTheDocument();
    });
  });

  describe("on failed login", () => {
    it("should error properly", async () => {
      const { App } = setupAppIntegrationTest({ initEntries: [loginUrl()] });
      render(<App />);

      server.use(
        ...stacksWithResources({
          accounts: [testEnvExpress],
          apps: [testAppDeployed],
        }),
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
        rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.set("Content-Type", "application/json"),
            ctx.json({
              code: 401,
              exception_context: {},
              error: "invalid_credentials",
              message: "mock error message",
            }),
          );
        }),
      );

      const email = await screen.findByRole("textbox", { name: "email" });
      await act(async () => {
        await userEvent.type(email, testEmail);
      });
      const pass = await screen.findByLabelText("Password");
      await act(async () => {
        await userEvent.type(pass, "1234");
      });
      const btn = await screen.findByRole("button");
      fireEvent.click(btn);
      expect(await screen.findByText("mock error message")).toBeInTheDocument();
    });
  });
});
