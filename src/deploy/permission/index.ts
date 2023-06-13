import { selectDeploy } from "../slice";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { selectCurrentUserRoles } from "@app/roles";
import { createReducerMap, createTable } from "@app/slice-helpers";
import {
  AppState,
  LinkResponse,
  Permission,
  PermissionScope,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export interface PermissionResponse {
  id: string;
  scope: PermissionScope;
  _links: {
    account: LinkResponse;
    role: LinkResponse;
  };
  _type: "permission";
}

export const defaultPermissionResponse = (
  r: Partial<PermissionResponse> = {},
): PermissionResponse => {
  return {
    id: "",
    scope: "unknown",
    _links: {
      account: defaultHalHref(),
      role: defaultHalHref(),
    },
    _type: "permission",
    ...r,
  };
};

export const defaultPermission = (r: Partial<Permission> = {}): Permission => {
  return {
    id: "",
    scope: "unknown",
    environmentId: "",
    roleId: "",
    ...r,
  };
};

export const deserializePermission = (
  permission: PermissionResponse,
): Permission => {
  return {
    id: permission.id,
    scope: permission.scope,
    environmentId: extractIdFromLink(permission._links.account),
    roleId: extractIdFromLink(permission._links.role),
  };
};

export const PERMISSIONS_NAME = "permissions";
const permissions = createTable<Permission>({
  name: PERMISSIONS_NAME,
});
const { add: addPermissions } = permissions.actions;

export const permissionReducers = createReducerMap(permissions);

export const {
  selectTable: selectPermissions,
  selectTableAsList: selectPermissionsAsList,
} = permissions.getSelectors(
  (s: AppState) => selectDeploy(s)[PERMISSIONS_NAME] || {},
);

export const selectPermsByAccount = createSelector(
  selectPermissionsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (perms, envId) => {
    return perms.filter((p) => p.environmentId === envId);
  },
);

/*
 * This is where most of the business logic lives for determining
 * if a user has permissions to do something based on the `scope`
 * provided to this function.
 */
export const selectUserHasPerms = createSelector(
  selectPermsByAccount,
  selectCurrentUserRoles,
  (_: AppState, p: { scope: PermissionScope }) => p.scope,
  (perms, userRoles, scope) => {
    const isAdmin = userRoles.find((r) =>
      ["owner", "platform_owner"].includes(r.type),
    );
    // admins can do everything on an account
    if (isAdmin) {
      return true;
    }

    // if user is not an admin and there are no perms then they
    // cannot do anything with an account
    if (perms.length === 0) {
      return false;
    }

    // correlate perms on an account with user's roles
    const userPerms = perms.filter((r) =>
      userRoles.map((r) => r.id).includes(r.roleId),
    );
    if (userPerms.length === 0) {
      return false;
    }

    // if user has ANY permissions on an Account that means they have
    // access to basic_read
    if (scope === "basic_read") {
      return true;
    }

    for (let i = 0; i < userPerms.length; i += 1) {
      const perm = userPerms[i];
      // admins can do everything on an account
      if (perm.scope === "admin") {
        return true;
      }

      if (perm.scope === scope) {
        return true;
      }
    }

    // default case is no perms
    return false;
  },
);

export const permissionEntities = {
  permission: defaultEntity({
    id: "permission",
    save: addPermissions,
    deserialize: deserializePermission,
  }),
};
