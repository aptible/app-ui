import { createSelector } from "@app/fx";
import {
  appDetailUrl,
  databaseDetailUrl,
  environmentIntegrationsUrl,
} from "@app/routes";
import type { WebState } from "@app/schema";
import type { DeployActivityRow, OperationType } from "@app/types";
import { findAppById, selectApps } from "../app";
import { findDatabaseById, selectDatabases } from "../database";
import { findEndpointById, getEndpointUrl, selectEndpoints } from "../endpoint";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironmentsByOrg,
} from "../environment";
import { findLogDrainById, selectLogDrains } from "../log-drain";
import { findMetricDrainById, selectMetricDrains } from "../metric-drain";
import { selectOperationById, selectOperationsAsList } from "../operation";
import { findServiceById, selectServices } from "../service";

const selectActivityForTable = createSelector(
  selectOperationsAsList,
  selectEnvironmentsByOrg,
  selectDatabases,
  selectApps,
  selectServices,
  selectLogDrains,
  selectMetricDrains,
  (ops, envs, dbs, apps, services, logDrains, metricDrains) =>
    ops
      .filter((op) => {
        const env = findEnvById(envs, { id: op.environmentId });
        return hasDeployEnvironment(env);
      })
      .map((op): DeployActivityRow => {
        const env = findEnvById(envs, { id: op.environmentId });
        let resourceHandle = "";
        if (op.resourceType === "app") {
          const app = findAppById(apps, { id: op.resourceId });
          resourceHandle = app.handle;
        } else if (op.resourceType === "database") {
          const db = findDatabaseById(dbs, { id: op.resourceId });
          resourceHandle =
            op.diskSize && op.containerSize
              ? `${db.handle} (${op.diskSize} GB Disk - ${op.containerSize} MB Memory)`
              : db.handle;
        } else if (op.resourceType === "service") {
          const service = findServiceById(services, { id: op.resourceId });
          let url;
          if (service.appId !== "") {
            // TODO - temporary until we have a service detail page
            url = appDetailUrl(service.appId);
          } else if (service.databaseId !== "") {
            url = databaseDetailUrl(service.databaseId);
          }
          resourceHandle =
            op.containerCount && op.containerSize
              ? `${service.processType} (${op.containerCount} Container(s) - ${op.containerSize} MB Memory)`
              : service.processType;
          return { ...op, envHandle: env.handle, resourceHandle, url };
        } else if (op.resourceType === "log_drain") {
          const logDrain = findLogDrainById(logDrains, { id: op.resourceId });
          resourceHandle = logDrain.handle;
          const url = environmentIntegrationsUrl(logDrain.environmentId);
          return { ...op, envHandle: env.handle, resourceHandle, url };
        } else if (op.resourceType === "metric_drain") {
          const metricDrain = findMetricDrainById(metricDrains, {
            id: op.resourceId,
          });
          resourceHandle = metricDrain.handle;
          const url = environmentIntegrationsUrl(metricDrain.environmentId);
          return { ...op, envHandle: env.handle, resourceHandle, url };
        } else {
          resourceHandle = op.resourceId;
        }

        return { ...op, envHandle: env.handle, resourceHandle };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
);

const denyOpTypes: OperationType[] = ["poll"];

export const selectActivityByIdsForTable = createSelector(
  selectActivityForTable,
  (_: WebState, p: { ids: string[] }) => p.ids,
  (ops, opIds) => {
    return ops.filter(
      (op) => opIds.includes(op.id) && !denyOpTypes.includes(op.type),
    );
  },
);

export const selectResourceNameByOperationId = createSelector(
  selectOperationById,
  selectDatabases,
  selectApps,
  selectEndpoints,
  (op, dbs, apps, enps) => {
    let resourceHandle = "";
    if (op.resourceType === "app") {
      const app = findAppById(apps, { id: op.resourceId });
      resourceHandle = app.handle;
    } else if (op.resourceType === "database") {
      const db = findDatabaseById(dbs, { id: op.resourceId });
      resourceHandle = db.handle;
    } else if (op.resourceType === "vhost") {
      const enp = findEndpointById(enps, { id: op.resourceId });
      resourceHandle = getEndpointUrl(enp);
    } else {
      resourceHandle = op.resourceId;
    }

    return resourceHandle;
  },
);
