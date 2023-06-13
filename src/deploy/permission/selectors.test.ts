// @vitest-environment node
import { defaultPermission, selectUserHasPerms } from "./index";
import { createId } from "@app/mocks";
import { defaultRole } from "@app/roles";
import { AppState, DeepPartial, PermissionScope } from "@app/types";

describe("selectUserHasPerms", () => {
  describe("when user is an `owner`", () => {
    it("should grant full read/write access to any account", () => {
      const role = defaultRole({
        id: `${createId()}`,
        name: "Owners",
        type: "owner",
      });
      const envId = `${createId()}`;

      const state: DeepPartial<AppState> = {
        deploy: {
          permissions: {},
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

  describe("when user is an `platform_owner`", () => {
    it("should grant full read/write access to any account", () => {
      const role = defaultRole({
        id: `${createId()}`,
        name: "Platform Owners",
        type: "platform_owner",
      });
      const envId = `${createId()}`;

      const state: DeepPartial<AppState> = {
        deploy: {
          permissions: {},
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

  describe("when user is a `platform_user`", () => {
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

          const state: DeepPartial<AppState> = {
            deploy: {
              permissions: {
                [perm.id]: perm,
              },
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

          const state: DeepPartial<AppState> = {
            deploy: {
              permissions: {
                [perm.id]: perm,
              },
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

          const state: DeepPartial<AppState> = {
            deploy: {
              permissions: {},
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

          const state: DeepPartial<AppState> = {
            deploy: {
              permissions: {
                [perm.id]: perm,
              },
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

            const state: DeepPartial<AppState> = {
              deploy: {
                permissions: {
                  [perm.id]: perm,
                },
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
