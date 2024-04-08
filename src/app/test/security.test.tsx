import {
  server,
  testElevatedToken,
  testEnv,
  testUserNotVerified,
  testUserVerified,
  verifiedUserHandlers,
} from "@app/mocks";
import {
  securitySettingsUrl,
  settingsUrl,
  sshSettingsUrl,
  teamSsoUrl,
} from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("Settings", () => {
  it("should not allow unverified users to access security page", async () => {
    server.use(...verifiedUserHandlers({ user: testUserNotVerified }));
    const { App, store } = setupAppIntegrationTest({
      initEntries: [securitySettingsUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByRole("heading", { name: /Check your Email/ });
  });

  it("should have elevated token to access security page", async () => {
    server.use(
      ...verifiedUserHandlers(),
      rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
        return res(ctx.json(testElevatedToken));
      }),
    );
    const { App, store } = setupAppIntegrationTest({
      initEntries: [securitySettingsUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testUserVerified.email));
    const pass = await screen.findByLabelText("Password");
    await act(() => userEvent.type(pass, "1234"));
    const btn = await screen.findByRole("button", { name: /Confirm/ });
    fireEvent.click(btn);

    await screen.findByRole("heading", { name: /Security Settings/ });
  });

  it("should have elevated token to access security page", async () => {
    server.use(
      ...verifiedUserHandlers(),
      rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
        return res(ctx.json(testElevatedToken));
      }),
    );
    const { App, store } = setupAppIntegrationTest({
      initEntries: [sshSettingsUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testUserVerified.email));
    const pass = await screen.findByLabelText("Password");
    await act(() => userEvent.type(pass, "1234"));
    const btn = await screen.findByRole("button", { name: /Confirm/ });
    fireEvent.click(btn);

    await screen.findByRole("heading", { name: /SSH Keys/ });
  });

  it("should not allow unverified users to access settings page", async () => {
    server.use(...verifiedUserHandlers({ user: testUserNotVerified }));
    const { App, store } = setupAppIntegrationTest({
      initEntries: [settingsUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByRole("heading", { name: /Check your Email/ });
  });

  it("should not allow non-account owners to access SSO settings page", async () => {
    server.use(...verifiedUserHandlers());
    const { App, store } = setupAppIntegrationTest({
      initEntries: [teamSsoUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByRole("heading", { name: /Environments/ });
  });
});
