import { activityReportEntities } from "./activity-report";
import { appEntities } from "./app";
import { serviceDefinitionEntities } from "./app-service-definitions";
import { backupEntities } from "./backup";
import { backupRpEntities } from "./backup-retention-policy";
import { certificateEntities } from "./certificate";
import { appConfigEntities } from "./configuration";
import { containerEntities } from "./container";
import { costEntities } from "./cost";
import { dashboardEntities } from "./dashboard";
import { databaseEntities } from "./database";
import { credEntities } from "./database-credential";
import { databaseImageEntities } from "./database-images";
import { diskEntities } from "./disk";
import { endpointEntities } from "./endpoint";
import { environmentEntities } from "./environment";
import { imageEntities } from "./image";
import { logDrainEntities } from "./log-drain";
import { manualScaleRecommendationEntities } from "./manual_scale_recommendation";
import { metricDrainEntities } from "./metric-drain";
import { opEntities } from "./operation";
import { permissionEntities } from "./permission";
import { activePlanEntities, planEntities } from "./plan";
import { releaseEntities } from "./release";
import { serviceEntities } from "./service";
import { serviceSizingPolicyEntities } from "./service-sizing-policy";
import { stackEntities } from "./stack";
import { vpcPeerEntities } from "./vpc-peer";
import { vpnTunnelEntities } from "./vpn-tunnel";

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
  ...serviceSizingPolicyEntities,
  ...manualScaleRecommendationEntities,
  ...costEntities,
  ...dashboardEntities,
};
