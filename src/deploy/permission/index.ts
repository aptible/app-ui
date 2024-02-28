import { api, thunks } from "@app/api";
import { selectMembershipsByRoleId } from "@app/auth";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  selectCurrentUserRoles,
  selectCurrentUserRolesByOrgId,
  selectRolesByOrgId,
} from "@app/roles";
import { WebState, schema } from "@app/schema";
import { LinkResponse, Permission, PermissionScope } from "@app/types";

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
    ...r,
    _type: "permission",
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

export const selectPermissions = schema.permissions.selectTable;
export const selectPermissionsAsList = schema.permissions.selectTableAsList;

export const selectIsAccountOwner = createSelector(
  selectCurrentUserRolesByOrgId,
  (roles) => roles.some((r) => r.type === "owner"),
);

export const selectIsPlatformOwner = createSelector(
  selectCurrentUserRolesByOrgId,
  (roles) => roles.some((r) => r.type === "platform_owner"),
);

export const selectIsRoleAdmin = createSelector(
  selectMembershipsByRoleId,
  (_: WebState, p: { userId: string }) => p.userId,
  (memberships, userId) => {
    return memberships
      .filter((m) => m.userId === userId)
      .some((m) => m.privileged);
  },
);

export const selectRolesEditable = createSelector(
  selectRolesByOrgId,
  selectIsAccountOwner,
  selectIsPlatformOwner,
  (roles, isAccountOwner, isPlatformOwner) => {
    if (isAccountOwner) {
      return roles;
    }

    if (isPlatformOwner) {
      // platform owners are not allowed to add owner role to a user
      return roles.filter((r) => r.type !== "owner");
    }

    return [];
  },
);

export const selectIsUserOwner = createSelector(
  selectIsAccountOwner,
  selectIsPlatformOwner,
  (isAccountOwner, isPlatformOwner) => isAccountOwner || isPlatformOwner,
);

export const selectCanUserManageRole = createSelector(
  selectIsUserOwner,
  selectIsRoleAdmin,
  (isOwner, isRoleAdmin) => {
    return isOwner || isRoleAdmin;
  },
);

export const selectIsUserAnyOwner = createSelector(
  selectCurrentUserRoles,
  (roles) => {
    return roles.some((r) => r.type === "owner" || r.type === "platform_owner");
  },
);

export const selectAllPermissions = createSelector(
  selectPermissionsAsList,
  (perms) => {
    return perms;
  },
);

export const selectPermsByAccount = createSelector(
  selectPermissionsAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  (perms, envId) => {
    return perms.filter((p) => p.environmentId === envId);
  },
);

export const selectFormattedPermissionsByRoleAndAccount = createSelector(
  selectPermissionsAsList,
  (_: WebState, p: { envs: any }) => p.envs,
  (perms, envs) => {
    const allEnvsObj = envs.reduce((acc: any, env: any) => {
      const retObj: { [key: string]: any } = { ...acc };
      if (!retObj[env.id]) retObj[env.id] = env;
      return retObj;
    }, {});

    const permsByRoleId = perms.reduce<{
      [key: string]: { [key: string]: any };
    }>((acc, perm) => {
      const retObj: { [key: string]: any } = { ...acc };
      if (!retObj[perm.roleId]) retObj[perm.roleId] = {};
      if (!retObj[perm.roleId][perm.environmentId]) {
        retObj[perm.roleId][perm.environmentId] = [
          { ...perm, handle: allEnvsObj[perm.environmentId].handle },
        ];
      } else if (retObj[perm.roleId][perm.environmentId]) {
        retObj[perm.roleId][perm.environmentId] = [
          ...retObj[perm.roleId][perm.environmentId],
          perm,
        ];
      }

      return retObj;
    }, {});

    return permsByRoleId;
  },
);

export const selectPermsByAccountAndRole = createSelector(
  selectPermsByAccount,
  (_: WebState, p: { roleId: any }) => p.roleId,
  (perms, roleId) => perms.filter((p) => p.roleId === roleId),
);

/*
 * This is where most of the business logic lives for determining
 * if a user has permissions to do something based on the `scope`
 * provided to this function.
 */
export const selectUserHasPerms = createSelector(
  selectPermsByAccount,
  selectCurrentUserRoles,
  (_: WebState, p: { scope: PermissionScope }) => p.scope,
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

      // anything created under `obserability` a `deploy` perm can do
      if (perm.scope === "deploy" && scope === "observability") {
        return true;
      }

      // `sensitive` perm can read anyting under `read` scope
      if (perm.scope === "sensitive" && scope === "read") {
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
    save: schema.permissions.add,
    deserialize: deserializePermission,
  }),
};

interface AddPermProps {
  envId: string;
  roleId: string;
  scope: PermissionScope;
}

interface RmPermProps {
  id: string;
}

type UpdatePermProps =
  | { type: "add"; payload: AddPermProps }
  | { type: "rm"; payload: RmPermProps };

export const updatePerm = thunks.create<UpdatePermProps>(
  "update-perms",
  function* (ctx, next) {
    const { type, payload } = ctx.payload;
    const id = ctx.name;
    yield* schema.update(schema.loaders.start({ id }));

    if (type === "add") {
      const addCtx = yield* addPerm.run(payload);
      if (addCtx.json.ok) {
        yield* schema.update(
          schema.loaders.success({
            id,
            message: "Successfully updated permissions!",
          }),
        );
      } else {
        yield* schema.update(
          schema.loaders.error({ id, message: addCtx.json.error.message }),
        );
      }
    } else {
      const rmCtx = yield* deletePerm.run(payload);
      if (rmCtx.json.ok) {
        yield* schema.update(
          schema.loaders.success({
            id,
            message: "Successfully updated permissions!",
          }),
        );
      } else {
        yield* schema.update(
          schema.loaders.error({ id, message: rmCtx.json.error.message }),
        );
      }
    }

    yield* next();
  },
);

export const addPerm = api.post<AddPermProps>(
  "/accounts/:envId/permissions",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        role: ctx.payload.roleId,
        scope: ctx.payload.scope,
      }),
    });

    yield* next();
  },
);

export const deletePerm = api.delete<RmPermProps>(
  "/permissions/:id",
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.permissions.remove([ctx.payload.id]));
  },
);
