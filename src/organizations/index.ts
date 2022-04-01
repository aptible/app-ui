import { call, select } from 'saga-query';
import { createReducerMap, createTable, createAssign } from 'robodux';
import { createSelector } from 'reselect';

import { authApi, AuthApiCtx } from '@app/api';
import {
  AppState,
  Organization,
  LinkResponse,
  ApiGen,
  HalEmbedded,
} from '@app/types';
import { defaultEntity } from '@app/hal';
import { selectToken } from '@app/token';
import { exchangeToken } from '@app/auth';

interface OrganizationResponse {
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
  _links: {
    billing_detail: LinkResponse;
    invitations: LinkResponse;
    roles: LinkResponse;
    security_officer: LinkResponse;
    self: LinkResponse;
    users: LinkResponse;
  };
  _type: 'organization';
}

export const ORGANIZATIONS_NAME = 'organizations';
export const ORGANIZATION_SELECTED_NAME = 'organizationSelected';

const organizations = createTable<Organization>({
  name: ORGANIZATIONS_NAME,
});

const organizationSelected = createAssign<string>({
  name: ORGANIZATION_SELECTED_NAME,
  initialState: '',
});

const { add: addOrganizations } = organizations.actions;
export const { set: setOrganizationSelected } = organizationSelected.actions;

export const reducers = createReducerMap(organizations, organizationSelected);

const { selectTable: selectOrganizations } = organizations.getSelectors(
  (s: AppState) => s[ORGANIZATIONS_NAME],
);

const selectOrganizationSelectedId = (s: AppState) =>
  s[ORGANIZATION_SELECTED_NAME] || '';

export const defaultOrganization = (
  o: Partial<Organization> = {},
): Organization => ({
  id: '',
  name: '',
  ...o,
});
export const hasOrganization = (o: Organization): boolean => !!o.id;

const initOrg = defaultOrganization();
export const selectOrganizationSelected = createSelector(
  selectOrganizations,
  selectOrganizationSelectedId,
  (orgs, id): Organization => {
    const orgList = Object.values(orgs);
    if (orgList.length === 0) {
      return initOrg;
    }

    const org = orgs[id];
    if (org) {
      return org;
    }

    return orgList[0] || initOrg;
  },
);

function deserializeOrganization(o: OrganizationResponse): Organization {
  return {
    id: o.id,
    name: o.name,
  };
}

type FetchOrgCtx = AuthApiCtx<
  HalEmbedded<{ organizations: OrganizationResponse[] }>
>;
export const fetchOrganizations = authApi.get(
  '/organizations',
  function* onFetchOrgs(ctx: FetchOrgCtx, next) {
    yield next();
    if (!ctx.json.ok) return;

    const orgs = ctx.json.data._embedded.organizations;
    if (orgs.length > 0) {
      ctx.actions.push(setOrganizationSelected(orgs[0].id));
    }
  },
);

interface CreateOrg {
  name: string;
}

export type OrgCtx = AuthApiCtx<OrganizationResponse, CreateOrg>;

export const createOrganization = authApi.post<CreateOrg>(
  '/organizations',
  function* onCreateOrg(ctx: OrgCtx, next): ApiGen {
    const { name } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({ name }),
    });
    yield next();
    const token = yield select(selectToken);
    if (!ctx.json.ok) return;

    yield call(exchangeToken.run, exchangeToken(token));
    ctx.actions.push(setOrganizationSelected(ctx.json.data.id));
  },
);

export const entities = {
  organization: defaultEntity({
    id: 'organization',
    save: addOrganizations,
    deserialize: deserializeOrganization,
  }),
};
