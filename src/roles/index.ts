import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, db } from "@app/schema";
import { LinkResponse, Role, RoleType, excludesFalse } from "@app/types";

export interface RoleResponse {
  id: string;
  name: string;
  type: RoleType;
  created_at: string;
  updated_at: string;
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
    _links: {
      organization: defaultHalHref(),
    },
    _type: "role",
    ...r,
  };
};

export const deserializeRole = (role: RoleResponse): Role => {
  return {
    id: role.id,
    name: role.name,
    type: role.type,
    createdAt: role.created_at,
    updatedAt: role.updated_at,
    organizationId: extractIdFromLink(role._links.organization),
  };
};

const deployRoles: RoleType[] = ["owner", "platform_owner", "platform_user"];
export const selectRolesByOrgId = createSelector(
  db.roles.selectTableAsList,
  (_: WebState, p: { orgId: string }) => p.orgId,
  (roles, orgId) =>
    roles
      .filter((r) => r.organizationId === orgId)
      .filter((r) => deployRoles.includes(r.type)),
);

export const selectCurrentUserRoles = createSelector(
  db.roles.selectTable,
  db.currentUserRoles.select,
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
    save: db.roles.add,
    deserialize: deserializeRole,
  }),
};
