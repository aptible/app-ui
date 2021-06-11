import { createApp } from 'robodux';
import sagaCreator from 'redux-saga-creator';

import { AppState } from '@app/types';

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

const packages = createApp<AppState>(corePackages);
export const rootReducer = packages.reducer;

export const rootEntities = corePackages.reduce((acc, pkg) => {
  if (!pkg.entities) return acc;
  return { ...acc, ...pkg.entities };
}, {});

const sagas = corePackages.reduce(
  (acc, pkg) => {
    if (!pkg.sagas) return acc;
    return { ...acc, ...pkg.sagas };
  },
  {
    api: api.api.saga(),
    authApi: api.authApi.saga(),
  },
);

export const rootSaga = sagaCreator(sagas, (err: Error) => {
  /* if (env.isProduction) {
    Sentry.captureException(err);
  } */
  console.error(err);
});
