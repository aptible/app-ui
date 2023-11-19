import { api, authApi, billingApi, metricTunnelApi, thunks } from "@app/api";
import * as auth from "@app/auth";
import * as billing from "@app/billing";
import * as bootup from "@app/bootup";
import * as deploy from "@app/deploy";
import * as env from "@app/env";
import * as feedback from "@app/feedback";
import * as hal from "@app/hal";
import * as invitations from "@app/invitations";
import * as metrics from "@app/metric-tunnel";
import * as mfa from "@app/mfa";
import * as modal from "@app/modal";
import * as nav from "@app/nav";
import * as orgs from "@app/organizations";
import * as redirectPath from "@app/redirect-path";
import * as resetStore from "@app/reset-store";
import * as roles from "@app/roles";
import * as search from "@app/search";
import * as signal from "@app/signal";
import * as theme from "@app/theme";
import * as token from "@app/token";
import * as users from "@app/users";

const corePackages: any[] = [
  env,
  feedback,
  auth,
  users,
  token,
  invitations,
  hal,
  resetStore,
  redirectPath,
  orgs,
  bootup,
  mfa,
  api,
  theme,
  deploy,
  modal,
  roles,
  nav,
  signal,
  search,
  metrics,
  billing,
];

export const rootEntities = corePackages.reduce((acc, pkg) => {
  if (!pkg.entities) {
    return acc;
  }
  return { ...acc, ...pkg.entities };
}, {});

export const reducers = corePackages.reduce((acc, pkg) => {
  if (!pkg.reducers) {
    return acc;
  }
  return { ...acc, ...pkg.reducers };
}, {});

const initialSagas = {
  api: api.saga(),
  authApi: authApi.saga(),
  metricTunnelApi: metricTunnelApi.saga(),
  thunks: thunks.saga(),
  billingApi: billingApi.saga(),
};

export const sagas = corePackages.reduce((acc, pkg) => {
  if (!pkg.sagas) {
    return acc;
  }
  return { ...acc, ...pkg.sagas };
}, initialSagas);
