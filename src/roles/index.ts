import { authApi } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import { titleCase } from "@app/string-utils";
import {
  type HalEmbedded,
  type LinkResponse,
  type Role,
  type RoleType,
  excludesFalse,
} from "@app/types";
import { type UserResponse, selectUsersAsList } from "@app/users";

export interface RoleResponse {
  id: string;
  name: string;
  type: RoleType;
  created_at: string;
  updated_at: string;
  scim_created: boolean;
  _links: {
    organization: LinkResponse;
  };
  _type: "role";
}

export const defaultRoleResponse = (
  r: Partial<RoleResponse> = {},
): RoleResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    type: "platform_user",
    created_at: now,
    updated_at: now,
    scim_created: false,
    _links: {
      organization: defaultHalHref(),
    },
    ...r,
    _type: "role",
  };
};

export const deserializeRole = (role: RoleResponse): Role => {
  return {
    id: role.id,
    name: role.name,
    type: role.type,
    createdAt: role.created_at,
    updatedAt: role.updated_at,
    scimCreated: role.scim_created,
    organizationId: extractIdFromLink(role._links.organization),
  };
};

export const roleTypeFormat = (role: Role): string => {
  return titleCase(role.type);
};

export const selectRoleById = schema.roles.selectById;

export const ignoreComplianceRoles = (r: Role) =>
  r.type !== "compliance_user" && r.type !== "compliance_owner";

export const getIsOwnerRole = (r: Role) =>
  r.type === "owner" || r.type === "platform_owner";

export const selectRolesByOrgId = createSelector(
  schema.roles.selectTableAsList,
  (_: WebState, p: { orgId: string }) => p.orgId,
  (roles, orgId) => {
    return roles
      .filter((r) => r.organizationId === orgId)
      .filter(ignoreComplianceRoles)
      .sort((a, b) => {
        if (a.type === "owner" && b.type === "platform_owner") {
          return -1;
        }
        if (a.type === "platform_owner" && b.type === "owner") {
          return 1;
        }
        if (a.type === "owner" || a.type === "platform_owner") {
          return -1;
        }
        if (b.type === "owner" || b.type === "platform_owner") {
          return 1;
        }
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  },
);

export const selectUserIdToRoleIdsMap = createSelector(
  selectUsersAsList,
  schema.memberships.selectTableAsList,
  selectRolesByOrgId,
  (users, memberships, roles) => {
    const mapper: { [key: string]: Role[] } = {};
    for (const user of users) {
      const userRoles = roles.filter((role) => {
        const hasMembership = memberships.some(
          (m) => m.roleId === role.id && m.userId === user.id,
        );
        return hasMembership;
      });
      mapper[user.id] = userRoles;
    }
    return mapper;
  },
);

export const selectCurrentUserRoles = createSelector(
  schema.roles.selectTable,
  schema.currentUserRoles.select,
  (roles, roleIds) => roleIds.map((id) => roles[id]).filter(excludesFalse),
);

export const selectCurrentUserRolesByOrgId = createSelector(
  selectCurrentUserRoles,
  (_: WebState, p: { orgId: string }) => p.orgId,
  (roles, orgId) => roles.filter((r) => r.organizationId === orgId),
);

export const selectIsUserOwner = createSelector(
  selectCurrentUserRolesByOrgId,
  (roles) =>
    roles.some((r) => r.type === "owner" || r.type === "platform_owner"),
);

export const selectIsUserAnyOwner = createSelector(
  selectCurrentUserRoles,
  (_: WebState, p: { orgId: string }) => p.orgId,
  (roles, orgId) => roles.filter((r) => r.organizationId === orgId),
);

export const entities = {
  role: defaultEntity({
    id: "role",
    save: schema.roles.add,
    deserialize: deserializeRole,
  }),
};

export const fetchRoles = authApi.get<{ orgId: string }>(
  "/organizations/:orgId/roles",
);
export const fetchCurrentUserRoles = authApi.get<
  { userId: string },
  HalEmbedded<{ roles: RoleResponse[] }>
>("/users/:userId/roles", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.roles.map((r) => r.id);
  yield* schema.update(schema.currentUserRoles.set(ids));
});

export const fetchUserRoles = authApi.get<
  { userId: string },
  HalEmbedded<{ roles: RoleResponse[] }>
>(["/users/:userId/roles", "user"], authApi.cache());

export const fetchUsersForRole = authApi.get<
  { roleId: string },
  HalEmbedded<{ users: UserResponse[] }>
>("/roles/:roleId/users", authApi.cache());

export const updateRoleName = authApi.put<{ id: string; name: string }>(
  "/roles/:id",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ name: ctx.payload.name }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Successfully updated role name!" };
  },
);

export const createRoleForOrg = authApi.post<{ orgId: string; name: string }>(
  "/organizations/:orgId/roles",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ name: ctx.payload.name, type: "platform_user" }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: `Successfully created ${ctx.payload.name} role!` };
  },
);

export const deleteRole = authApi.delete<{ id: string }>(
  "/roles/:id",
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.roles.remove([ctx.payload.id]));
  },
);
