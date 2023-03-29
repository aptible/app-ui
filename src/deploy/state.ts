import { combineReducers } from "@reduxjs/toolkit";

import { appEntities, appReducers } from "./app";
import {
  serviceDefinitionEntities,
  serviceDefinitionReducers,
} from "./app-service-definitions";
import { databaseEntities, databaseReducers } from "./database";
import {
  databaseImageEntities,
  databaseImageReducers,
} from "./database-images";
import { endpointEntities, endpointReducers } from "./endpoint";
import { environmentEntities, environmentReducers } from "./environment";
import { logDrainEntities, logDrainReducers } from "./log-drain";
import { opEntities, opReducers } from "./operation";
import { serviceEntities, serviceReducers } from "./service";
import { stackEntities, stackReducers } from "./stack";

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
