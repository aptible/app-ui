import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createAssign,
  createReducerMap,
  createTable,
} from "@app/slice-helpers";
import {
  AppState,
  LinkResponse,
  Role,
  RoleType,
  excludesFalse,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

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

export const defaultRole = (r: Partial<Role> = {}): Role => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    name: "",
    type: "platform_user",
    createdAt: now,
    updatedAt: now,
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

export const ROLES_NAME = "roles";
const roles = createTable<Role>({
  name: ROLES_NAME,
});
const { add: addRoles } = roles.actions;

export const USER_ROLES_NAME = "currentUserRoles";
export const userRoles = createAssign<string[]>({
  name: USER_ROLES_NAME,
  initialState: [],
});
export const { set: setCurrentUserRoleIds } = userRoles.actions;

export const reducers = createReducerMap(roles, userRoles);

export const { selectTable: selectRoles } = roles.getSelectors(
  (s: AppState) => s[ROLES_NAME],
);

export const selectCurrentUserRoleIds = (s: AppState) =>
  s[USER_ROLES_NAME] || [];
export const selectCurrentUserRoles = createSelector(
  selectRoles,
  selectCurrentUserRoleIds,
  (roles, roleIds) => roleIds.map((id) => roles[id]).filter(excludesFalse),
);

export const selectIsUserAnyOwner = createSelector(
  selectCurrentUserRoles,
  (roles) => {
    return roles.some((r) => r.type === "owner" || r.type === "platform_owner");
  },
);

export const entities = {
  role: defaultEntity({
    id: "role",
    save: addRoles,
    deserialize: deserializeRole,
  }),
};
