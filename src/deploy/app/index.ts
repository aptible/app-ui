import { api, cacheTimer } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { DeployApp, AppState } from "@app/types";

import { deserializeImage } from "../image";
import { deserializeOperation } from "../operation";
import { selectDeploy } from "../slice";

export * from "./utils";

export const deserializeDeployApp = (payload: any): DeployApp => {
  const serviceIds: string[] = payload._embedded.services.map((s: any) => s.id);
  const links = payload._links;
  const embedded = payload._embedded;

  return {
    id: `${payload.id}`,
    serviceIds,
    handle: payload.handle,
    gitRepo: payload.git_repo,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    deploymentMethod: payload.deployment_method,
    status: payload.status,
    environmentId: extractIdFromLink(links.account),
    currentConfigurationId: extractIdFromLink(links.current_configuration),
    currentImage: deserializeImage(embedded.current_image),
    lastDeployOperation: deserializeOperation(embedded.last_deploy_operation),
    lastOperation: deserializeOperation(embedded.last_operation),
  };
};

export const defaultDeployApp = (a: Partial<DeployApp> = {}): DeployApp => {
  const now = new Date().toISOString();
  return {
    id: "",
    serviceIds: [],
    handle: "",
    gitRepo: "",
    createdAt: now,
    updatedAt: now,
    deploymentMethod: "",
    status: "pending",
    environmentId: "",
    currentConfigurationId: "",
    currentImage: null,
    lastDeployOperation: null,
    lastOperation: null,
    ...a,
  };
};

export const DEPLOY_APP_NAME = "apps";
const slice = createTable<DeployApp>({ name: DEPLOY_APP_NAME });
const { add: addDeployApps } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_APP_NAME],
);
const initApp = defaultDeployApp();
const must = mustSelectEntity(initApp);
export const selectAppById = must(selectors.selectById);
export const { selectTableAsList: selectAppsAsList } = selectors;
export const hasDeployApp = (a: DeployApp) => a.id !== "";
export const appReducers = createReducerMap(slice);

export const fetchApps = api.get("/apps", { saga: cacheTimer() });
export const fetchApp = api.get<{ id: string }>("/apps/:id", {
  saga: cacheTimer(),
});
export const fetchAppOperations = api.get<{ id: string }>(
  "/apps/:id/operations",
  { saga: cacheTimer() },
  api.cache(),
);

export const appEntities = {
  app: defaultEntity({
    id: "app",
    deserialize: deserializeDeployApp,
    save: addDeployApps,
  }),
};
