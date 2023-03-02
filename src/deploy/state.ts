import { combineReducers } from "@reduxjs/toolkit";

import { appReducers, appEntities } from "./app";
import {
  serviceDefinitionEntities,
  serviceDefinitionReducers,
} from "./app-service-definitions";
import { stackReducers, stackEntities } from "./stack";
import { environmentReducers, environmentEntities } from "./environment";
import { endpointReducers, endpointEntities } from "./endpoint";
import { databaseEntities, databaseReducers } from "./database";
import {
  databaseImageEntities,
  databaseImageReducers,
} from "./database-images";
import { logDrainEntities, logDrainReducers } from "./log-drain";
import { serviceEntities, serviceReducers } from "./service";
import { opEntities, opReducers } from "./operation";

const allReducers: any[] = [
  appReducers,
  serviceDefinitionReducers,
  stackReducers,
  environmentReducers,
  endpointReducers,
  databaseReducers,
  logDrainReducers,
  serviceReducers,
  databaseImageReducers,
  opReducers,
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
  ...serviceDefinitionEntities,
  ...stackEntities,
  ...environmentEntities,
  ...endpointEntities,
  ...databaseEntities,
  ...logDrainEntities,
  ...serviceEntities,
  ...databaseImageEntities,
  ...opEntities,
};
