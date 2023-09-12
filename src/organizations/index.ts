import { createSelector } from "@reduxjs/toolkit";

import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createAssign,
  createReducerMap,
  createTable,
} from "@app/slice-helpers";
import {
  AppState,
  LinkResponse,
  Organization,
  excludesFalse,
} from "@app/types";

export interface OrganizationResponse {
  address: string;
  city: string;
  created_at: string;
  emergency_phone: string;
  id: string;
  name: string;
  ops_alert_email: string;
  primary_phone: string;
  security_alert_email: string;
  state: string;
  updated_at: string;
  zip: string;
  reauth_required?: boolean;
  _links: {
    billing_detail: LinkResponse;
    invitations: LinkResponse;
    roles: LinkResponse;
    security_officer: LinkResponse;
    self: LinkResponse;
    users: LinkResponse;
  };
  _type: "organization";
}

export const defaultOrgResponse = (
  o: Partial<OrganizationResponse> = {},
): OrganizationResponse => {
  const now = new Date().toISOString();
  return {
    address: "",
    city: "",
    created_at: now,
    updated_at: now,
    emergency_phone: "",
    id: "",
    name: "",
    ops_alert_email: "",
    primary_phone: "",
    security_alert_email: "",
    state: "",
    zip: "",
    _links: {
      billing_detail: { href: "" },
      invitations: { href: "" },
      roles: { href: "" },
      security_officer: { href: "" },
      self: { href: "" },
      users: { href: "" },
      ...o._links,
    },
    _type: "organization",
    ...o,
  };
};

export const ORGANIZATIONS_NAME = "organizations";
export const ORGANIZATION_SELECTED_NAME = "organizationSelected";

const organizations = createTable<Organization>({
  name: ORGANIZATIONS_NAME,
});

const organizationSelected = createAssign<string>({
  name: ORGANIZATION_SELECTED_NAME,
  initialState: "",
});

const { add: addOrganizations } = organizations.actions;
export const { set: setOrganizationSelected } = organizationSelected.actions;

export const reducers = createReducerMap(organizations, organizationSelected);

const selectors = organizations.getSelectors(
  (s: AppState) => s[ORGANIZATIONS_NAME],
);
export const selectOrganizationsAsList = createSelector(
  selectors.selectTable,
  (orgMap) => {
    return Object.values(orgMap)
      .filter(excludesFalse)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  },
);

export const selectOrganizationSelectedId = (s: AppState) =>
  s[ORGANIZATION_SELECTED_NAME] || "";

export const defaultOrganization = (
  o: Partial<Organization> = {},
): Organization => ({
  id: "",
  name: "",
  billingDetailId: "",
  updatedAt: new Date().toISOString(),
  reauthRequired: false,
  ...o,
});
export const hasOrganization = (o: Organization): boolean => !!o.id;

const initOrg = defaultOrganization();
export const selectOrganizationSelected = createSelector(
  selectOrganizationsAsList,
  selectOrganizationSelectedId,
  (orgs, id): Organization => {
    if (orgs.length === 0) {
      return initOrg;
    }
    if (!id) {
      return initOrg;
    }

    const org = orgs.find((o) => o.id === id);
    if (org) {
      return org;
    }

    return initOrg;
  },
);

function deserializeOrganization(o: OrganizationResponse): Organization {
  return {
    id: o.id,
    name: o.name,
    updatedAt: o.updated_at,
    billingDetailId: extractIdFromLink(o._links.billing_detail),
    reauthRequired: o.reauth_required || false,
  };
}

export const entities = {
  organization: defaultEntity({
    id: "organization",
    save: addOrganizations,
    deserialize: deserializeOrganization,
  }),
};
