import * as env from '@app/env';
import * as loaders from '@app/loaders';
import * as users from '@app/users';
import * as token from '@app/token';
import * as invitations from '@app/invitations';
import * as auth from '@app/auth';
import * as hal from '@app/hal';
import * as resetStore from '@app/reset-store';
import * as redirectPath from '@app/redirect-path';
import * as orgs from '@app/organizations';
import * as bootup from '@app/bootup';
import * as mfa from '@app/mfa';
import * as api from '@app/api';

const corePackages: any[] = [
  env,
  loaders,
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
];

export const rootEntities = corePackages.reduce((acc, pkg) => {
  if (!pkg.entities) return acc;
  return { ...acc, ...pkg.entities };
}, {});

export const reducers = corePackages.reduce((acc, pkg) => {
  if (!pkg.reducers) return acc;
  return { ...acc, ...pkg.reducers };
}, {});

export const sagas = corePackages.reduce(
  (acc, pkg) => {
    if (!pkg.sagas) return acc;
    return { ...acc, ...pkg.sagas };
  },
  {
    api: api.api.saga(),
    authApi: api.authApi.saga(),
  },
);
