import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import {
  server,
  testEmail,
  testEnv,
  testToken,
  verifiedUserHandlers,
} from "@app/mocks";
import { elevateUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";

describe("Elevate page", () => {
  it("should naviate to redirect url", async () => {
    server.use(...verifiedUserHandlers());
    const { App, store } = setupAppIntegrationTest({
      initEntries: [elevateUrl()],
    });
    await waitForBootup(store);
    render(<App />);

    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("Password");
    await act(() => userEvent.type(pass, "1234"));
    const btn = await screen.findByRole("button", { name: /Confirm/ });
    fireEvent.click(btn);

    await screen.findByRole("heading", {
      level: 1,
      name: "Choose an Option",
    });
  });

  describe("on failed login", () => {
    it("should error properly", async () => {
      server.use(
        rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              code: 401,
              exception_context: {},
              error: "invalid_credentials",
              message: "mock error message",
            }),
          );
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [elevateUrl("/")],
      });

      await waitForBootup(store);

      render(<App />);

      const email = await screen.findByRole("textbox", { name: "email" });
      await act(() => userEvent.type(email, testEmail));
      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "1234"));

      const btn = await screen.findByRole("button", { name: /Confirm/ });
      fireEvent.click(btn);

      expect(await screen.findByText("mock error message")).toBeInTheDocument();
    });
  });

  describe("otp required", () => {
    it("should display otp input", async () => {
      server.use(
        rest.post(`${testEnv.authUrl}/tokens`, async (req, res, ctx) => {
          const data = await req.json();
          if (data.otp_token === "111222") {
            return res(ctx.json(testToken));
          }

          return res(
            ctx.status(400),
            ctx.json({
              code: 400,
              exception_context: {},
              error: "otp_token_required",
              message: "",
            }),
          );
        }),
        ...verifiedUserHandlers(),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [elevateUrl("/")],
      });

      await waitForBootup(store);

      render(<App />);

      const email = await screen.findByRole("textbox", { name: "email" });
      await act(() => userEvent.type(email, testEmail));
      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "1234"));

      const btn = await screen.findByRole("button", { name: /Confirm/ });
      fireEvent.click(btn);

      await screen.findByText(/You must enter your 2FA token to continue/);
      expect(
        screen.queryByText(/You must enter your 2FA token to continue/),
      ).toBeInTheDocument();

      const otp = await screen.findByLabelText(
        /Two-Factor Authentication Required/,
      );
      await act(() => userEvent.type(otp, "111222"));

      const fbtn = await screen.findByRole("button", { name: /Confirm/ });
      fireEvent.click(fbtn);

      await screen.findByRole("heading", {
        level: 1,
        name: "Choose an Option",
      });
    });
  });
});
