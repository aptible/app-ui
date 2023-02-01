import {
  api,
  cacheTimer,
  combinePages,
  DeployApiCtx,
  PaginateProps,
  thunks,
} from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  DeployApp,
  AppState,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

import { selectEnvironments, findEnvById } from "../environment";
import { deserializeImage } from "../image";
import { deserializeOperation } from "../operation";
import { selectDeploy } from "../slice";

export * from "./utils";

export interface DeployAppResponse {
  id: string;
  handle: string;
  git_repo: string;
  created_at: string;
  updated_at: string;
  deployment_method: string;
  status: ProvisionableStatus;
  _links: {
    account: LinkResponse;
    current_configuration: LinkResponse;
  };
  _embedded: {
    // TODO: fill in
    services: { id: string }[];
    current_image: any;
    last_deploy_operation: any;
    last_operation: any;
  };
}

export const deserializeDeployApp = (payload: DeployAppResponse): DeployApp => {
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
export const hasDeployApp = (a: DeployApp) => a.id !== "";
export const appReducers = createReducerMap(slice);

const initApp = defaultDeployApp();
const must = mustSelectEntity(initApp);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_APP_NAME],
);
export const selectAppById = must(selectors.selectById);
export const { selectTableAsList: selectAppsAsList } = selectors;

export interface DeployAppRow extends DeployApp {
  envHandle: string;
}

export const selectAppsForTable = createSelector(
  selectAppsAsList,
  selectEnvironments,
  (apps, envs) =>
    apps
      .map((app): DeployAppRow => {
        const env = findEnvById(envs, { id: app.environmentId });
        return { ...app, envHandle: env.handle };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle)),
);

const selectSearchProp = (_: AppState, props: { search: string }) =>
  props.search.toLocaleLowerCase();

export const selectAppsForTableSearch = createSelector(
  selectAppsForTable,
  selectSearchProp,
  (apps, search): DeployAppRow[] => {
    if (search === "") {
      return apps;
    }

    return apps.filter((app) => {
      const handle = app.handle.toLocaleLowerCase();
      const envHandle = app.envHandle.toLocaleLowerCase();

      let lastOpUser = "";
      let lastOpType = "";
      let lastOpStatus = "";
      if (app.lastOperation) {
        lastOpUser = app.lastOperation.userName.toLocaleLowerCase();
        lastOpType = app.lastOperation.type.toLocaleLowerCase();
        lastOpStatus = app.lastOperation.status.toLocaleLowerCase();
      }

      const handleMatch = handle.includes(search);
      const envMatch = envHandle.includes(search);
      const userMatch = lastOpUser !== "" && lastOpUser.includes(search);
      const opMatch = lastOpType !== "" && lastOpType.includes(search);
      const opStatusMatch =
        lastOpStatus !== "" && lastOpStatus.includes(search);

      return handleMatch || envMatch || opMatch || opStatusMatch || userMatch;
    });
  },
);

export const fetchApps = api.get<PaginateProps>("/apps?page=:page", {
  saga: cacheTimer(),
});

export const fetchAllApps = thunks.create(
  "fetch-all-apps",
  { saga: cacheTimer() },
  combinePages(fetchApps),
);

export const fetchApp = api.get<{ id: string }>("/apps/:id", {
  saga: cacheTimer(),
});

export const fetchAppOperations = api.get<{ id: string }>(
  "/apps/:id/operations",
  { saga: cacheTimer() },
  api.cache(),
);

interface CreateAppProps {
  name: string;
  envId: string;
}

export type CreateAppCtx = DeployApiCtx<DeployAppResponse, CreateAppProps>;

export const createDeployApp = api.post<CreateAppProps>(
  "/accounts/:envId/apps",
  function* (ctx: CreateAppCtx, next) {
    const { name, envId } = ctx.payload;
    const body = {
      handle: name,
      account_id: envId,
    };
    ctx.request = ctx.req({
      body: JSON.stringify(body),
    });

    yield next();
  },
);

interface CreateAppOpProps {
  appId: string;
  env: { [key: string]: string | boolean | number };
}
export type CreateAppOpCtx = DeployApiCtx<any, CreateAppOpProps>;
export const createAppOperation = api.post<CreateAppOpProps>(
  "/apps/:appId/operations",
  function* (ctx: CreateAppOpCtx, next) {
    const { env } = ctx.payload;
    const body = { env, type: "configure" };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield next();
  },
);

export const appEntities = {
  app: defaultEntity({
    id: "app",
    deserialize: deserializeDeployApp,
    save: addDeployApps,
  }),
};
