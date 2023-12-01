import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { db } from "@app/schema";
import { LinkResponse, Organization, excludesFalse } from "@app/types";

export interface OrganizationResponse {
  address: string | null;
  city: string | null;
  created_at: string;
  emergency_phone: string | null;
  id: string;
  name: string;
  ops_alert_email: string | null;
  primary_phone: string | null;
  security_alert_email: string | null;
  state: string | null;
  updated_at: string;
  zip: string | null;
  reauth_required?: boolean;
  sso_enforced: boolean;
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
    sso_enforced: false,
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

export const selectOrganizationById = db.organizations.selectById;
export const selectOrganizationsAsList = createSelector(
  db.organizations.selectTable,
  (orgMap) => {
    return Object.values(orgMap)
      .filter(excludesFalse)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  },
);
export const selectOrganizationSelectedId = db.organizationSelected.select;
export const hasOrganization = (o: Organization): boolean => !!o.id;

export const selectOrganizationSelected = createSelector(
  selectOrganizationsAsList,
  selectOrganizationSelectedId,
  (orgs, id): Organization => {
    if (orgs.length === 0) {
      return db.organizations.empty;
    }
    if (!id) {
      return db.organizations.empty;
    }

    const org = orgs.find((o) => o.id === id);
    if (org) {
      return org;
    }

    return db.organizations.empty;
  },
);

function deserializeOrganization(o: OrganizationResponse): Organization {
  return {
    id: o.id,
    name: o.name,
    updatedAt: o.updated_at,
    ssoEnforced: o.sso_enforced,
    billingDetailId: extractIdFromLink(o._links.billing_detail),
    reauthRequired: o.reauth_required || false,
    address: o.address || "",
    city: o.city || "",
    zip: o.zip || "",
    state: o.state || "",
    securityAlertEmail: o.security_alert_email || "",
    opsAlertEmail: o.ops_alert_email || "",
    emergencyPhone: o.emergency_phone || "",
    primaryPhone: o.primary_phone || "",
  };
}

export const entities = {
  organization: defaultEntity({
    id: "organization",
    save: db.organizations.add,
    deserialize: deserializeOrganization,
  }),
};
