import { selectEnv } from "@app/config";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { schema } from "@app/schema";
import {
  type LinkResponse,
  type Organization,
  excludesFalse,
} from "@app/types";

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

export const selectOrganizationById = schema.organizations.selectById;
export const selectOrganizationsAsList = createSelector(
  schema.organizations.selectTable,
  (orgMap) => {
    return Object.values(orgMap)
      .filter(excludesFalse)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  },
);
export const selectOrganizationSelectedId = schema.organizationSelected.select;
export const hasOrganization = (o: Organization): boolean => !!o.id;
export const selectHasManyOrgs = createSelector(
  selectOrganizationsAsList,
  (organizations) => organizations.length > 1,
);

export const selectOrganizationSelected = createSelector(
  selectOrganizationsAsList,
  selectOrganizationSelectedId,
  (orgs, id): Organization => {
    if (orgs.length === 0) {
      return schema.organizations.empty;
    }
    if (!id) {
      return schema.organizations.empty;
    }

    const org = orgs.find((o) => o.id === id);
    if (org) {
      return org;
    }

    return schema.organizations.empty;
  },
);

export const selectHasBetaFeatures = createSelector(
  selectOrganizationSelectedId,
  selectEnv,
  (orgId, config) => {
    if (config.isDev) {
      return true;
    }

    // Array of organization IDs that have access to beta features
    const betaFeatureOrgIds = config.betaFeatureOrgIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return betaFeatureOrgIds.includes(orgId);
  },
);

export const selectHasScimFeature = createSelector(
  selectOrganizationSelectedId,
  selectEnv,
  (orgId, config) => {
    if (config.isDev) {
      return true;
    }

    // Array of organization IDs that have access to scim feature
    const scimFeatureOrgIds = config.scimFeatureOrgIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return scimFeatureOrgIds.includes(orgId);
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
    save: schema.organizations.add,
    deserialize: deserializeOrganization,
  }),
};
