import {
  server,
  stacksWithResources,
  testAccount,
  testEnv,
  testRole,
  testUserMembership,
  testUserMembershipPrivileged,
  verifiedUserHandlers,
} from "@app/mocks";
import { roleDetailMembersUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("Role Detail Members Page as a Role Admin", () => {
  it("Role Admin can view email input", async () => {
    server.use(
      rest.get(
        `${testEnv.authUrl}/roles/:roleId/memberships`,
        (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: {
                memberships: [testUserMembershipPrivileged],
              },
            }),
          );
        },
      ),
      ...verifiedUserHandlers({ role: testRole }),
      ...stacksWithResources({ accounts: [testAccount] }),
      rest.post(
        `${testEnv.apiUrl}/roles/${testRole.id}/invitations`,
        (_, res, ctx) => {
          return res(
            ctx.json({
              status: 201,
            }),
          );
        },
      ),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [roleDetailMembersUrl(testRole.id)],
    });

    await waitForBootup(store);

    render(<App />);

    const email = await screen.findByRole("textbox", { name: "email" });
    expect(email).toBeInTheDocument();
  });
  it("validate email input", async () => {
    server.use(
      rest.get(
        `${testEnv.authUrl}/roles/:roleId/memberships`,
        (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: {
                memberships: [testUserMembershipPrivileged],
              },
            }),
          );
        },
      ),
      ...verifiedUserHandlers({ role: testRole }),
      ...stacksWithResources({ accounts: [testAccount] }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [roleDetailMembersUrl(testRole.id)],
    });

    await waitForBootup(store);

    render(<App />);

    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, "<test>!#@"));
    const el = await screen.findByRole("button", { name: /Invite New User/ });
    fireEvent.click(el);

    expect(await screen.findByText("Must provide valid email")).toBeVisible();
  });
});

describe("Role Detail Members Page as a Regular User", () => {
  it("Regular user CANNOT view email input", async () => {
    server.use(
      rest.get(
        `${testEnv.authUrl}/roles/:roleId/memberships`,
        (_, res, ctx) => {
          return res(
            ctx.json({
              _embedded: {
                memberships: [testUserMembership],
              },
            }),
          );
        },
      ),
      ...verifiedUserHandlers({ role: testRole }),
      ...stacksWithResources({ accounts: [testAccount] }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [roleDetailMembersUrl(testRole.id)],
    });

    await waitForBootup(store);

    render(<App />);

    const email = screen.queryByRole("textbox", { name: "email" });
    expect(email).not.toBeInTheDocument();
  });
});
