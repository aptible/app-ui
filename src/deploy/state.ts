import { combineReducers } from '@reduxjs/toolkit';

import { appReducers, appEntities } from './app';
import { stackReducers, stackEntities } from './stack';
import { environmentReducers, environmentEntities } from './environment';
import { endpointReducers, endpointEntities } from './endpoint';
import { databaseEntities, databaseReducers } from './database';
import { logDrainEntities, logDrainReducers } from './log-drain';

const allReducers: any[] = [
  appReducers,
  stackReducers,
  environmentReducers,
  endpointReducers,
  databaseReducers,
  logDrainReducers,
];

const rootReducer = combineReducers(
  allReducers.reduce((acc, red) => {
    return { ...acc, ...red };
  }, {}),
);

export const reducers = {
  deploy: rootReducer,
};

export const entities = {
  ...appEntities,
  ...stackEntities,
  ...environmentEntities,
  ...endpointEntities,
  ...databaseEntities,
  ...logDrainEntities,
};
