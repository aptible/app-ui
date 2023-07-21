import { combineReducers } from "@reduxjs/toolkit";

import { appEntities, appReducers } from "./app";
import {
  serviceDefinitionEntities,
  serviceDefinitionReducers,
} from "./app-service-definitions";
import { certificateEntities, certificateReducers } from "./certificate";
import { appConfigEntities, appConfigReducers } from "./configuration";
import { containerEntities, containerReducers } from "./container";
import { databaseEntities, databaseReducers } from "./database";
import {
  databaseImageEntities,
  databaseImageReducers,
} from "./database-images";
import { endpointEntities, endpointReducers } from "./endpoint";
import { environmentEntities, environmentReducers } from "./environment";
import { logDrainEntities, logDrainReducers } from "./log-drain";
import { metricDrainEntities, metricDrainReducers } from "./metric-drain";
import { opEntities, opReducers } from "./operation";
import { permissionEntities, permissionReducers } from "./permission";
import {
  activePlanEntities,
  activePlanReducers,
  planEntities,
  planReducers,
} from "./plan";
import { releaseEntities, releaseReducers } from "./release";
import { serviceEntities, serviceReducers } from "./service";
import { stackEntities, stackReducers } from "./stack";
import { vpcPeerEntities, vpcPeerReducers } from "./vpc_peer";
import { vpnTunnelEntities, vpnTunnelReducers } from "./vpn_tunnel";

const allReducers: any[] = [
  appReducers,
  certificateReducers,
  serviceDefinitionReducers,
  stackReducers,
  environmentReducers,
  endpointReducers,
  databaseReducers,
  logDrainReducers,
  metricDrainReducers,
  serviceReducers,
  databaseImageReducers,
  opReducers,
  planReducers,
  activePlanReducers,
  permissionReducers,
  releaseReducers,
  containerReducers,
  vpcPeerReducers,
  vpnTunnelReducers,
  appConfigReducers,
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
  ...certificateEntities,
  ...serviceDefinitionEntities,
  ...stackEntities,
  ...environmentEntities,
  ...endpointEntities,
  ...databaseEntities,
  ...logDrainEntities,
  ...metricDrainEntities,
  ...serviceEntities,
  ...databaseImageEntities,
  ...opEntities,
  ...planEntities,
  ...activePlanEntities,
  ...permissionEntities,
  ...releaseEntities,
  ...containerEntities,
  ...vpcPeerEntities,
  ...vpnTunnelEntities,
  ...appConfigEntities,
};
