import {
  server,
  testEnv,
  testVerifiedInvitation,
  verifiedUserHandlers,
} from "@app/mocks";
import { teamAcceptInviteUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("Accept invitation flows", () => {
  describe("existing user - already logged in", () => {
    it("should let the user accept an invitation to a new org", async () => {
      server.use(...verifiedUserHandlers());
      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamAcceptInviteUrl(testVerifiedInvitation.id, "222")],
      });

      await waitForBootup(store);

      render(<App />);

      const btn = await screen.findByRole("button", { name: /Accept Invite/ });
      fireEvent.click(btn);
      await screen.findByRole("heading", { name: /Environments/ });
    });
  });

  describe("existing user - login", () => {
    it("should let the user login and accept the invitation", async () => {
      server.use(
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
        ...verifiedUserHandlers(),
      );
      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamAcceptInviteUrl(testVerifiedInvitation.id, "222")],
      });

      await waitForBootup(store);

      render(<App />);

      const signup = await screen.findByRole("link", { name: /log in here/ });
      fireEvent.click(signup);

      const pass = await screen.findByLabelText("Password");
      await act(() => userEvent.type(pass, "1234"));
      const login = await screen.findByRole("button", { name: /Log In/ });
      fireEvent.click(login);

      const btn = await screen.findByRole("button", { name: /Accept Invite/ });
      fireEvent.click(btn);
      await screen.findByRole("heading", { name: /Environments/ });
    });
  });

  describe("new user - signup", () => {
    // This test unfortunately cannot test what happens during email
    //  verification flow because we cannot force jsdom to navigate to
    //  email verification page with verification code preloaded.
    // Instead we just mark the user as verified so it skips the
    //  verification step.  Not ideal as this is one area that is going to
    //  be tricky to get right.
    it("should let user signup and then accept invitation", async () => {
      server.use(
        rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
        ...verifiedUserHandlers(),
      );
      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamAcceptInviteUrl(testVerifiedInvitation.id, "222")],
      });

      await waitForBootup(store);

      render(<App />);

      const name = await screen.findByRole("textbox", { name: "name" });
      await act(() => userEvent.type(name, "mock name"));
      const pass = await screen.findByLabelText("password");
      await act(() => userEvent.type(pass, "Aptible!1234"));

      const signupBtn = await screen.findByRole("button", {
        name: "Create Account",
      });
      expect(signupBtn).not.toBeDisabled();
      fireEvent.click(signupBtn);

      const btn = await screen.findByRole("button", { name: /Accept Invite/ });
      fireEvent.click(btn);
      await screen.findByRole("heading", { name: /Environments/ });
    });
  });
});
