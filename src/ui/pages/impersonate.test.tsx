import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { act } from "react-dom/test-utils";

import { defaultHalHref } from "@app/hal";
import {
  createId,
  createText,
  mockJwtHeaders,
  server,
  testEmail,
  testEnv,
  testOrg,
  testUserId,
} from "@app/mocks";
import { defaultOrgResponse } from "@app/organizations";
import { HOME_PATH, IMPERSONATE_PATH, impersonateUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup, waitForToken } from "@app/test";
import { TokenSuccessResponse, defaultTokenResponse } from "@app/token";
import { UserResponse, defaultUserResponse } from "@app/users";

import { ImpersonatePage } from "./impersonate";

const testImpersonatedOrgId = `${createId()}`;
const testImpersonatedEmail = "impersonated@aptible.com";

describe("when no email or org supplied", () => {
  it("should have the button disabled", async () => {
    const token = testImpersonateToken("read-only");
    const testUser = defaultUserResponse({
      id: testUserId,
      email: testEmail,
      read_only_impersonate: true,
    });
    server.use(...impersonateHandlers({ token, user: testUser }));

    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button", { name: "Impersonate" });
    expect(btn).toBeDisabled();
  });
});

describe("when user is not superuser or has no read impersonation perms", () => {
  it("should redirect to home", async () => {
    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
      additionalRoutes: [{ path: HOME_PATH, element: <div>We are home</div> }],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    await screen.findByText(/We are home/);
  });
});

describe("when user.read_only_impersonate", () => {
  it("should not display write permission checkbox", async () => {
    const token = testImpersonateToken("read-only");
    const testUser = defaultUserResponse({
      id: testUserId,
      email: testEmail,
      read_only_impersonate: true,
    });
    server.use(...impersonateHandlers({ token, user: testUser }));

    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    const writeCheck = screen.queryByLabelText("Write Access");
    expect(writeCheck).not.toBeInTheDocument();
  });
});

describe("when user.superuser", () => {
  it("should display write permission checkbox", async () => {
    const token = testImpersonateToken("superuser");
    const testUser = defaultUserResponse({
      id: testUserId,
      email: testEmail,
      superuser: true,
    });

    server.use(...impersonateHandlers({ token, user: testUser }));

    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    const writeCheck = screen.queryByLabelText("Write Access");
    expect(writeCheck).toBeInTheDocument();
  });
});

describe("when there is an email but no org", () => {
  describe("when sso is checked", () => {
    it("should not allow user to submit", async () => {
      const token = testImpersonateToken("superuser");
      const testUser = defaultUserResponse({
        id: testUserId,
        email: testEmail,
        superuser: true,
      });
      server.use(...impersonateHandlers({ token, user: testUser }));

      const { TestProvider, store } = setupIntegrationTest({
        path: IMPERSONATE_PATH,
        initEntries: [impersonateUrl()],
      });

      await waitForBootup(store);
      await waitForToken(store);

      render(
        <TestProvider>
          <ImpersonatePage />
        </TestProvider>,
      );

      const email = await screen.findByRole("textbox", {
        name: "email",
      });
      await act(() => userEvent.type(email, "test@aptible.com"));

      const ssoCheck = await screen.findByLabelText(
        "Simulate SSO login for user in organization",
      );
      fireEvent.click(ssoCheck);

      const btn = await screen.findByRole("button", { name: "Impersonate" });
      expect(btn).toBeDisabled();
    });
  });

  it("should submit and display impersonated user and org", async () => {
    const token = testImpersonateToken("superuser");
    const testUser = defaultUserResponse({
      id: testUserId,
      email: testEmail,
      superuser: true,
    });
    server.use(...impersonateHandlers({ token, user: testUser }));

    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    const email = await screen.findByRole("textbox", {
      name: "email",
    });
    await act(() => userEvent.type(email, testImpersonatedEmail));

    const btn = await screen.findByRole("button", { name: "Impersonate" });
    fireEvent.click(btn);

    await screen.findByText(/impersonated@aptible.com/);
    await screen.findByText(/impersonated org/);
  });
});

describe("when there is an org href but no email", () => {
  describe("when sso is checked", () => {
    it("should not allow user to submit", async () => {
      const token = testImpersonateToken("superuser");
      const testUser = defaultUserResponse({
        id: testUserId,
        email: testEmail,
        superuser: true,
      });

      server.use(...impersonateHandlers({ token, user: testUser }));

      const { TestProvider, store } = setupIntegrationTest({
        path: IMPERSONATE_PATH,
        initEntries: [impersonateUrl()],
      });

      await waitForBootup(store);
      await waitForToken(store);

      render(
        <TestProvider>
          <ImpersonatePage />
        </TestProvider>,
      );

      const org = await screen.findByRole("textbox", {
        name: "org",
      });
      await act(() => userEvent.type(org, "1234"));

      const ssoCheck = await screen.findByLabelText(
        "Simulate SSO login for user in organization",
      );
      fireEvent.click(ssoCheck);

      const btn = await screen.findByRole("button", { name: "Impersonate" });
      expect(btn).toBeDisabled();
    });
  });

  it("should submit and display impersonated user and org", async () => {
    const token = testImpersonateToken("superuser");
    const testUser = defaultUserResponse({
      id: testUserId,
      email: testEmail,
      superuser: true,
    });
    server.use(...impersonateHandlers({ token, user: testUser }));

    const { TestProvider, store } = setupIntegrationTest({
      path: IMPERSONATE_PATH,
      initEntries: [impersonateUrl()],
    });

    await waitForBootup(store);
    await waitForToken(store);

    render(
      <TestProvider>
        <ImpersonatePage />
      </TestProvider>,
    );

    const org = await screen.findByRole("textbox", {
      name: "org",
    });
    await act(() => userEvent.type(org, testImpersonatedOrgId));

    const btn = await screen.findByRole("button", { name: "Impersonate" });
    fireEvent.click(btn);

    await screen.findByText(/impersonated@aptible.com/);
    await screen.findByText(/impersonated org/);
  });
});

function testImpersonateToken(impersonateType: "superuser" | "read-only") {
  const payload = btoa(
    JSON.stringify({
      read_only_impersonation: impersonateType === "read-only",
      superuser: impersonateType === "superuser",
    }),
  );
  const mockJwt = (mixin: string, id: string | number = "1") =>
    `${mockJwtHeaders}.${payload}.not_real_${mixin}_${id}`;

  return defaultTokenResponse({
    access_token: `${mockJwt(createId().toString())}`,
    id: `${createId()}`,
    _links: {
      self: defaultHalHref(),
      user: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
      actor: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
    },
  });
}

function impersonateHandlers({
  token,
  user,
}: {
  token: TokenSuccessResponse;
  user: UserResponse;
}) {
  const testImpersonatedOrg = defaultOrgResponse({
    name: createText("impersonated org"),
    id: testImpersonatedOrgId,
  });
  const testImpersonatedUser = defaultUserResponse({
    id: createId(),
    email: testImpersonatedEmail,
  });
  const testImpersonatedToken = (actorId: number) => {
    const payload = btoa(JSON.stringify({ some: "data" }));
    const mockJwt = (mixin: string, id: string | number = "1") =>
      `${mockJwtHeaders}.${payload}.not_real_${mixin}_${id}`;

    return defaultTokenResponse({
      access_token: `${mockJwt(createId().toString())}`,
      id: `${createId()}`,
      _links: {
        self: defaultHalHref(),
        user: defaultHalHref(
          `${testEnv.authUrl}/users/${testImpersonatedUser.id}`,
        ),
        actor: defaultHalHref(`${testEnv.authUrl}/users/${actorId}`),
      },
    });
  };
  const impersonatedToken = testImpersonatedToken(testUserId);

  return [
    rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
      return res(ctx.json(token));
    }),
    rest.get(
      `${testEnv.authUrl}/organizations/:orgId/users`,
      (req, res, ctx) => {
        const authorization = req.headers.get("authorization");
        const imp =
          `Bearer ${impersonatedToken.access_token}` === authorization;
        if (imp) {
          return res(
            ctx.json({ _embedded: { users: [testImpersonatedUser] } }),
          );
        }
        return res(ctx.json({ _embedded: { users: [user] } }));
      },
    ),
    rest.get(`${testEnv.authUrl}/organizations`, (req, res, ctx) => {
      const authorization = req.headers.get("authorization");
      const imp = `Bearer ${impersonatedToken.access_token}` === authorization;
      if (imp) {
        return res(
          ctx.json({ _embedded: { organizations: [testImpersonatedOrg] } }),
        );
      }

      return res(ctx.json({ _embedded: { organizations: [testOrg] } }));
    }),
    rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
      return res(ctx.json(impersonatedToken));
    }),
  ];
}
