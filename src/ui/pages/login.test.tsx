import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import {
  server,
  stacksWithResources,
  testAppDeployed,
  testEmail,
  testEnv,
  testEnvExpress,
  verifiedUserHandlers,
} from "@app/mocks";
import { loginUrl } from "@app/routes";
import { setupAppIntegrationTest } from "@app/test";

describe("Login page", () => {
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
        ...verifiedUserHandlers(),
      );

      const email = await screen.findByRole("textbox", { name: "email" });
      await act(() => userEvent.type(email, testEmail));
      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "1234"));
      const btn = await screen.findByRole("button", { name: /Log In/ });
      fireEvent.click(btn);

      await screen.findByRole("heading", {
        level: 1,
        name: "Deployments",
      });
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
      await act(() => userEvent.type(email, testEmail));
      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "1234"));

      const btn = await screen.findByRole("button");
      fireEvent.click(btn);

      expect(await screen.findByText("mock error message")).toBeInTheDocument();
    });
  });
});
