import { PermRequired } from "../layouts";
import { ButtonCreate, ButtonDestroy, PermissionGate } from "../shared";
import { defaultPermissionResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testRole,
} from "@app/mocks";
import { HOME_PATH } from "@app/routes";
import { setupIntegrationTest, waitForToken } from "@app/test";
import { render, screen } from "@testing-library/react";

const PermsPage = () => {
  return (
    <div>
      <ButtonCreate envId={`${testAccount.id}`}>Create</ButtonCreate>
      <ButtonDestroy envId={`${testAccount.id}`}>Destroy</ButtonDestroy>
      <PermissionGate envId={`${testAccount.id}`} scope="sensitive">
        <div>You have access!</div>
      </PermissionGate>
    </div>
  );
};

describe("PermRequired", () => {
  describe("when no access", () => {
    it("redirect to home", async () => {
      const { TestProvider, store } = setupIntegrationTest({
        path: "/private",
        initEntries: ["/private"],
        additionalRoutes: [{ path: HOME_PATH, element: <div>no access</div> }],
      });
      await waitForToken(store);

      render(
        <TestProvider>
          <PermRequired envId={`${testAccount.id}`} scope="read">
            <PermsPage />
          </PermRequired>
        </TestProvider>,
      );

      await screen.findByText(/no access/);
      expect(screen.queryByText(/no access/)).toBeInTheDocument();
    });
  });

  describe("when access", () => {
    it("show buttons", async () => {
      const testPerm = defaultPermissionResponse({
        id: `${createId()}`,
        scope: "read",
        _links: {
          account: defaultHalHref(`${testAccount.id}`),
          role: defaultHalHref(`${testRole.id}`),
        },
      });
      const handlers = stacksWithResources({
        accounts: [{ ...testAccount, _embedded: { permissions: [testPerm] } }],
      });
      server.use(...handlers);

      const { TestProvider, store } = setupIntegrationTest({
        path: "/private",
        initEntries: ["/private"],
        additionalRoutes: [{ path: HOME_PATH, element: <div>no access</div> }],
      });
      await waitForToken(store);

      render(
        <TestProvider>
          <PermRequired envId={`${testAccount.id}`} scope="read">
            <PermsPage />
          </PermRequired>
        </TestProvider>,
      );

      await screen.findByText(/Create/);
      expect(screen.queryByText(/Create/)).toBeInTheDocument();
    });
  });
});

describe("PermissionGate", () => {
  describe("when user has access to `sensitive` info", () => {
    it("should show the content", async () => {
      const testPerm = defaultPermissionResponse({
        id: `${createId()}`,
        scope: "sensitive",
        _links: {
          account: defaultHalHref(`${testAccount.id}`),
          role: defaultHalHref(`${testRole.id}`),
        },
      });
      const handlers = stacksWithResources({
        accounts: [{ ...testAccount, _embedded: { permissions: [testPerm] } }],
      });
      server.use(...handlers);

      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      await screen.findByText(/You have access!/);
      expect(screen.queryByText(/You have access!/)).toBeInTheDocument();
    });

    it("should hide the content", async () => {
      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      expect(screen.queryByText(/You have access!/)).not.toBeInTheDocument();
    });
  });
});

describe("ButtonCreate", () => {
  describe("when user cannot create resources", () => {
    it("should disable button", async () => {
      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      const createBtn = await screen.findByText(/Create/);
      expect(createBtn).toBeDisabled();
    });
  });

  describe("when user can create resources", () => {
    it("should enable button", async () => {
      const testPerm = defaultPermissionResponse({
        id: `${createId()}`,
        scope: "deploy",
        _links: {
          account: defaultHalHref(`${testAccount.id}`),
          role: defaultHalHref(`${testRole.id}`),
        },
      });
      const handlers = stacksWithResources({
        accounts: [{ ...testAccount, _embedded: { permissions: [testPerm] } }],
      });
      server.use(...handlers);

      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      const createBtn = await screen.findByText(/Create/);
      expect(createBtn).toBeEnabled();
    });
  });
});

describe("ButtonDestroy", () => {
  describe("when user cannot destroy resources", () => {
    it("should disable button", async () => {
      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      const createBtn = await screen.findByRole("button", { name: /Destroy/ });
      expect(createBtn).toBeDisabled();
    });
  });

  describe("when user can destroy resources", () => {
    it("should enable button", async () => {
      const testPerm = defaultPermissionResponse({
        id: `${createId()}`,
        scope: "destroy",
        _links: {
          account: defaultHalHref(`${testAccount.id}`),
          role: defaultHalHref(`${testRole.id}`),
        },
      });
      const handlers = stacksWithResources({
        accounts: [{ ...testAccount, _embedded: { permissions: [testPerm] } }],
      });
      server.use(...handlers);

      const { TestProvider, store } = setupIntegrationTest();
      await waitForToken(store);

      render(
        <TestProvider>
          <PermsPage />
        </TestProvider>,
      );

      const createBtn = await screen.findByText(/Destroy/);
      expect(createBtn).toBeEnabled();
    });
  });
});
