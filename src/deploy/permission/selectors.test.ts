// @vitest-environment node
import { createId } from "@app/mocks";
import { type WebState, defaultPermission, defaultRole } from "@app/schema";
import type { DeepPartial, PermissionScope } from "@app/types";
import { selectUserHasPerms } from "./index";

describe("selectUserHasPerms", () => {
  describe("when user is an `owner`", () => {
    it("should grant full read/write access to any account", () => {
      const role = defaultRole({
        id: `${createId()}`,
        name: "Owners",
        type: "owner",
      });
      const envId = `${createId()}`;

      const state: DeepPartial<WebState> = {
        permissions: {},
        roles: {
          [role.id]: role,
        },
        currentUserRoles: [role.id],
      };

      const actual = selectUserHasPerms(state as any, {
        envId,
        scope: "deploy",
      });
      expect(actual).toEqual(true);
    });
  });

  describe("when user is an `platform_owner`", () => {
    it("should grant full read/write access to any account", () => {
      const role = defaultRole({
        id: `${createId()}`,
        name: "Platform Owners",
        type: "platform_owner",
      });
      const envId = `${createId()}`;

      const state: DeepPartial<WebState> = {
        permissions: {},
        roles: {
          [role.id]: role,
        },
        currentUserRoles: [role.id],
      };

      const actual = selectUserHasPerms(state as any, {
        envId,
        scope: "deploy",
      });
      expect(actual).toEqual(true);
    });
  });

  describe("when user is a `platform_user`", () => {
    describe("when checking for `observability` scope", () => {
      describe("when user has `deploy` scope", () => {
        it("should return true", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "deploy",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "observability",
          });
          expect(actual).toEqual(true);
        });
      });

      describe("when user has `observability` scope", () => {
        it("should return true", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "observability",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "observability",
          });
          expect(actual).toEqual(true);
        });
      });
    });

    describe("when checking for `deploy` scope", () => {
      describe("when user has `deploy` permission", () => {
        it("should return true", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "deploy",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "deploy",
          });
          expect(actual).toEqual(true);
        });
      });

      describe("when user has `admin` permission", () => {
        it("should return true", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "admin",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "deploy",
          });
          expect(actual).toEqual(true);
        });
      });

      describe("when user does *not* have any permissions", () => {
        it("should return false", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;

          const state: DeepPartial<WebState> = {
            permissions: {},
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "deploy",
          });
          expect(actual).toEqual(false);
        });
      });

      describe("when user has `tunnel` permission", () => {
        it("should return false", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "tunnel",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "deploy",
          });
          expect(actual).toEqual(false);
        });
      });
    });

    describe("when user has `sensitive` permission", () => {
      describe("when scope is set to `read`", () => {
        it("should return true", () => {
          const role = defaultRole({
            id: `${createId()}`,
            name: "deployer",
            type: "platform_user",
          });
          const envId = `${createId()}`;
          const perm = defaultPermission({
            id: `${createId()}`,
            roleId: role.id,
            environmentId: `${envId}`,
            scope: "sensitive",
          });

          const state: DeepPartial<WebState> = {
            permissions: {
              [perm.id]: perm,
            },
            roles: {
              [role.id]: role,
            },
            currentUserRoles: [role.id],
          };

          const actual = selectUserHasPerms(state as any, {
            envId,
            scope: "read",
          });
          expect(actual).toEqual(true);
        });
      });
    });

    describe("when checking for `basic_read` scope", () => {
      const scopes: PermissionScope[] = [
        "basic_read",
        "destroy",
        "admin",
        "deploy",
        "read",
        "tunnel",
        "sensitive",
        "observability",
      ];

      scopes.forEach((scope) => {
        describe(`when user has ${scope} permission`, () => {
          it("should return true", () => {
            const role = defaultRole({
              id: `${createId()}`,
              name: "destroyer",
              type: "platform_user",
            });
            const envId = `${createId()}`;
            const perm = defaultPermission({
              id: `${createId()}`,
              roleId: role.id,
              environmentId: `${envId}`,
              scope,
            });

            const state: DeepPartial<WebState> = {
              permissions: {
                [perm.id]: perm,
              },
              roles: {
                [role.id]: role,
              },
              currentUserRoles: [role.id],
            };

            const actual = selectUserHasPerms(state as any, {
              envId,
              scope: "basic_read",
            });
            expect(actual).toEqual(true);
          });
        });
      });
    });
  });
});
