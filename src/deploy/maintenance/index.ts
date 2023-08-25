import { selectDeploy } from "../slice";
import { api, cacheTimer } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployMaintenanceResource, LinkResponse } from "@app/types";

export interface MaintenanceResourceResponse {
  id: string;
  handle: string;
  maintenance_deadline: string[];
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
}

export const deserializeMaintenanceResource = (
  payload: MaintenanceResourceResponse,
): DeployMaintenanceResource => {
  const links = payload._links;
  return {
    id: payload.id,
    handle: payload.handle,
    maintenanceDeadline: payload.maintenance_deadline,
    environmentId: extractIdFromLink(links.account),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const defaultDeployMaintenanceResource = (
  ld: Partial<DeployMaintenanceResource> = {},
): DeployMaintenanceResource => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    maintenanceDeadline: [now, now],
    environmentId: "",
    createdAt: now,
    updatedAt: now,
    ...ld,
  };
};

export const DEPLOY_MAINTENANCE_RESOURCE_NAME = "maintenanceResources";
const slice = createTable<DeployMaintenanceResource>({
  name: DEPLOY_MAINTENANCE_RESOURCE_NAME,
});
const { add: addDeployMaintenanceResources } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_MAINTENANCE_RESOURCE_NAME],
);
const initMaintenanceResource = defaultDeployMaintenanceResource();
const must = mustSelectEntity(initMaintenanceResource);
export const selectMaintenanceResourceById = must(selectors.selectById);
export const findMaintenanceResourceById = must(selectors.findById);
export const maintenanceResourceReducers = createReducerMap(slice);
export const {
  selectTableAsList: selectMaintenanceResourcesAsList,
  selectTable: selectMaintenanceResources,
} = selectors;

export const maintenanceResourceEntities = {
  maintenance_app: defaultEntity({
    id: "maintenance_app",
    deserialize: deserializeMaintenanceResource,
    save: addDeployMaintenanceResources,
  }),
  maintenance_database: defaultEntity({
    id: "maintenance_database",
    deserialize: deserializeMaintenanceResource,
    save: addDeployMaintenanceResources,
  }),
};

export const fetchMaintenanceApps = api.get("/maintenances/apps", {
  saga: cacheTimer(),
});

export const fetchMaintenanceDatabases = api.get("/maintenances/databases", {
  saga: cacheTimer(),
});
