import {
  server,
  stacksWithResources,
  testAccount,
  testEnv,
  testRole,
  testRoleOwner,
  testUserExtra,
  testUserMembershipPrivileged,
  testUserVerified,
  verifiedUserHandlers,
} from "@app/mocks";
import {
  roleDetailEnvironmentsUrl,
  roleDetailUrl,
  teamRolesUrl,
} from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("Role Settings", () => {
  it("should let me see all the roles in my Org", async () => {
    server.use(
      rest.get(
        `${testEnv.authUrl}/organizations/:orgId/roles`,
        (_, res, ctx) => {
          return res(
            ctx.json({ _embedded: { roles: [testRoleOwner, testRole] } }),
          );
        },
      ),
      rest.get(`${testEnv.authUrl}/users/:userId/roles`, (_, res, ctx) => {
        return res(
          ctx.json({ _embedded: { roles: [testRoleOwner, testRole] } }),
        );
      }),
      ...verifiedUserHandlers(),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [teamRolesUrl()],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByText(/Deploy User/);
    await screen.findByText(/Deploy Owner/);
    expect(screen.queryByText(/Deploy User/)).toBeInTheDocument();
  });

  describe("As an Organization owner", () => {
    it("should let me create roles", async () => {
      server.use(...verifiedUserHandlers({ role: testRoleOwner }));

      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamRolesUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("textbox", { name: /role-name/ });

      const input = await screen.findByRole("textbox", {
        name: /role-name/,
      });
      await act(() => userEvent.type(input, "my-role"));

      const btn = await screen.findByRole("button", { name: /New Role/ });
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);

      await screen.findByText("my-role");
    });
  });

  describe("As a Role admin", () => {
    it("should **not** let me create roles", async () => {
      server.use(...verifiedUserHandlers({ role: testRole }));

      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamRolesUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("textbox", { name: /role-name/ });

      const input = await screen.findByRole("textbox", {
        name: /role-name/,
      });
      await act(() => userEvent.type(input, "my-role"));

      const btn = await screen.findByRole("button", { name: /New Role/ });
      expect(btn).toBeDisabled();
    });
  });

  describe("As a non-admin Org user", () => {
    it("should **not** let me create roles", async () => {
      server.use(...verifiedUserHandlers({ role: testRole }));

      const { App, store } = setupAppIntegrationTest({
        initEntries: [teamRolesUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("textbox", { name: /role-name/ });

      const input = await screen.findByRole("textbox", {
        name: /role-name/,
      });
      await act(() => userEvent.type(input, "my-role"));

      const btn = await screen.findByRole("button", { name: /New Role/ });
      expect(btn).toBeDisabled();
    });
  });
});

describe("Role Detail - Members", () => {
  it("should let me see members of this role", async () => {
    server.use(...verifiedUserHandlers());

    const { App, store } = setupAppIntegrationTest({
      initEntries: [roleDetailUrl(testRole.id)],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByText(`${testUserVerified.email}`);
    expect(screen.queryByText(`${testUserVerified.email}`)).toBeInTheDocument();
  });

  describe("As an Organization owner", () => {
    it("should let me add existing user to role", async () => {
      server.use(
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: {
                  users: [testUserVerified, testUserExtra],
                },
              }),
            );
          },
        ),
        ...verifiedUserHandlers({ role: testRoleOwner }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [roleDetailUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testUserVerified.email}`);
      expect(
        screen.queryByText(`${testUserVerified.email}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(`${testUserExtra.email}`),
      ).not.toBeInTheDocument();

      await screen.findByText(`${testUserExtra.name}`);
      const userSelector = await screen.findByRole("combobox", {
        name: /add-existing-user/,
      });
      await act(() =>
        userEvent.selectOptions(userSelector, testUserExtra.name),
      );

      const btn = await screen.findByRole("button", {
        name: /Add Existing User/,
      });
      fireEvent.click(btn);

      await screen.findByText(`${testUserExtra.email}`);
      expect(screen.queryByText(`${testUserExtra.email}`)).toBeInTheDocument();
    });
  });

  describe("As a Role admin", () => {
    it("should let me add existing user to role", async () => {
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
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: {
                  users: [testUserVerified, testUserExtra],
                },
              }),
            );
          },
        ),
        ...verifiedUserHandlers({ role: testRole }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [roleDetailUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testUserVerified.email}`);
      expect(
        screen.queryByText(`${testUserVerified.email}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(`${testUserExtra.email}`),
      ).not.toBeInTheDocument();

      await screen.findByText(`${testUserExtra.name}`);
      const userSelector = await screen.findByRole("combobox", {
        name: /add-existing-user/,
      });
      await act(() =>
        userEvent.selectOptions(userSelector, testUserExtra.name),
      );

      const btn = await screen.findByRole("button", {
        name: /Add Existing User/,
      });
      fireEvent.click(btn);

      await screen.findByText(`${testUserExtra.email}`);
      expect(screen.queryByText(`${testUserExtra.email}`)).toBeInTheDocument();
    });
  });

  describe("As a non-admin Org user", () => {
    it("should **not** let me add existing user to role", async () => {
      server.use(
        rest.get(
          `${testEnv.authUrl}/organizations/:orgId/users`,
          (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: {
                  users: [testUserVerified, testUserExtra],
                },
              }),
            );
          },
        ),
        ...verifiedUserHandlers({ role: testRole }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [roleDetailUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testUserVerified.email}`);
      expect(
        screen.queryByText(`${testUserVerified.email}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(`${testUserExtra.email}`),
      ).not.toBeInTheDocument();

      expect(screen.queryByText(/Add Existing User/)).not.toBeInTheDocument();
    });
  });
});

describe("Role Detail - Environments", () => {
  it("should let me see environment permissions associated with this role", async () => {
    server.use(
      ...verifiedUserHandlers({ role: testRoleOwner }),
      ...stacksWithResources({ accounts: [testAccount] }),
    );

    const { App, store } = setupAppIntegrationTest({
      initEntries: [roleDetailEnvironmentsUrl(testRole.id)],
    });

    await waitForBootup(store);

    render(<App />);

    await screen.findByText(`${testAccount.handle}`);

    const checkDeploy = await screen.findByLabelText(/Deploy/);
    expect(checkDeploy).toBeChecked();
    const checkBasic = await screen.findByLabelText(/Basic Visibility/);
    expect(checkBasic).toBeChecked();
    const checkAdmin = await screen.findByLabelText(/Environment Admin/);
    expect(checkAdmin).not.toBeChecked();
  });

  describe("As an Organization owner", () => {
    it("should let me change roles", async () => {
      server.use(
        ...verifiedUserHandlers({ role: testRoleOwner }),
        ...stacksWithResources({ accounts: [testAccount] }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [roleDetailEnvironmentsUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testAccount.handle}`);

      const checkAdmin = await screen.findByLabelText(/Environment Admin/);
      expect(checkAdmin).not.toBeChecked();
      fireEvent.click(checkAdmin);

      await screen.findByText(/Successfully updated permissions!/);

      expect(checkAdmin).toBeChecked();
    });
  });

  describe("As a Role admin", () => {
    it("should let me change roles", async () => {
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
        initEntries: [roleDetailEnvironmentsUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testAccount.handle}`);

      const checkAdmin = await screen.findByLabelText(/Environment Admin/);
      expect(checkAdmin).not.toBeChecked();
      fireEvent.click(checkAdmin);

      await screen.findByText(/Successfully updated permissions!/);

      expect(checkAdmin).toBeChecked();
    });
  });

  describe("As a non-admin Org user", () => {
    it("should *not* let me change roles", async () => {
      server.use(
        ...verifiedUserHandlers({ role: testRole }),
        ...stacksWithResources({ accounts: [testAccount] }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [roleDetailEnvironmentsUrl(testRole.id)],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(`${testAccount.handle}`);

      const checkAdmin = await screen.findByLabelText(/Environment Admin/);
      expect(checkAdmin).not.toBeChecked();
      expect(checkAdmin).toBeDisabled();
    });
  });
});

describe("Role Detail - Settings", () => {
  describe("As an Organization owner", () => {
    it("should let me change name", () => {});

    it("should let me delete the role", () => {});
  });

  describe("As a Role admin", () => {
    it("should let me change name", () => {});

    it("should let me delete the role", () => {});
  });

  describe("As a non-admin Org user", () => {
    it("should **not** let me change name", () => {});

    it("should **not** let me delete the role", () => {});
  });
});
