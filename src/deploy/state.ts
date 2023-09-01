import { combineReducers } from "@reduxjs/toolkit";

import {
  activityReportEntities,
  activityReportReducers,
} from "./activity-report";
import { appEntities, appReducers } from "./app";
import {
  serviceDefinitionEntities,
  serviceDefinitionReducers,
} from "./app-service-definitions";
import { backupEntities, backupReducers } from "./backup";
import { backupRpEntities, backupRpReducers } from "./backup-retention-policy";
import { certificateEntities, certificateReducers } from "./certificate";
import { appConfigEntities, appConfigReducers } from "./configuration";
import { containerEntities, containerReducers } from "./container";
import { databaseEntities, databaseReducers } from "./database";
import { credEntities, credReducers } from "./database-credential";
import {
  databaseImageEntities,
  databaseImageReducers,
} from "./database-images";
import { diskEntities, diskReducers } from "./disk";
import { endpointEntities, endpointReducers } from "./endpoint";
import { environmentEntities, environmentReducers } from "./environment";
import { imageEntities, imageReducers } from "./image";
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
  backupReducers,
  backupRpReducers,
  credReducers,
  activityReportReducers,
  imageReducers,
  diskReducers,
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
  ...backupEntities,
  ...backupRpEntities,
  ...credEntities,
  ...activityReportEntities,
  ...imageEntities,
  ...diskEntities,
};
