import { api, authApi, billingApi, metricTunnelApi, thunks } from "@app/api";
import * as auth from "@app/auth";
import * as billing from "@app/billing";
import * as bootup from "@app/bootup";
import * as config from "@app/config";
import * as deploy from "@app/deploy";
import * as feedback from "@app/feedback";
import * as hal from "@app/hal";
import * as invitations from "@app/invitations";
import * as metrics from "@app/metric-tunnel";
import * as mfa from "@app/mfa";
import * as nav from "@app/nav";
import * as orgs from "@app/organizations";
import * as redirectPath from "@app/redirect-path";
import * as resetStore from "@app/reset-store";
import * as roles from "@app/roles";
import * as search from "@app/search";
import * as theme from "@app/theme";
import * as token from "@app/token";
import * as users from "@app/users";
import { Callable } from "starfx";

const corePackages: any[] = [
  config,
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
  roles,
  nav,
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

const initialSagas: { [key: string]: Callable<any> } = {
  api: api.bootup,
  authApi: authApi.bootup,
  metricTunnelApi: metricTunnelApi.bootup,
  thunks: thunks.bootup,
  billingApi: billingApi.bootup,
};

export const sagas = corePackages.reduce<{ [key: string]: Callable<any> }>(
  (acc, pkg) => {
    if (!pkg.sagas) {
      return acc;
    }
    return { ...acc, ...pkg.sagas };
  },
  initialSagas,
);

export const tasks = Object.values(sagas);
