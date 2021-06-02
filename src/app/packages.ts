import { createApp } from 'robodux';
import sagaCreator from 'redux-saga-creator';

import { AppState } from '@app/types';
import { api } from '@app/api';

import * as env from '@app/env';
import * as loaders from '@app/loaders';
import * as users from '@app/users';
import * as token from '@app/token';

const corePackages: any[] = [env, loaders];

const packages = createApp<AppState>(corePackages);
export const rootReducer = packages.reducer;

const sagas = corePackages.reduce(
  (acc, pkg) => {
    if (!pkg.sagas) return acc;
    return { ...acc, ...pkg.sagas };
  },
  {
    api: api.saga(),
  },
);

export const rootSaga = sagaCreator(sagas, (err: Error) => {
  /* if (env.isProduction) {
    Sentry.captureException(err);
  } */
  console.error(err);
});
