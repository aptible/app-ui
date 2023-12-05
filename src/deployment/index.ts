import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { createReducerMap, createTable } from "@app/slice-helpers";
import {
  AppState,
  DeployAppConfigEnv,
  Deployment,
  LinkResponse,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export interface DeploymentResponse {
  id: string;
  docker_image: string;
  git_ref: string;
  sha: string;
  config: DeployAppConfigEnv;
  created_at: string;
  updated_at: string;
  _links: {
    app: LinkResponse;
    operation: LinkResponse;
  };
  _type: "deployment";
}

export const defaultDeploymentResponse = (
  p: Partial<DeploymentResponse> = {},
): DeploymentResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    docker_image: "",
    git_ref: "",
    sha: "",
    config: {},
    created_at: now,
    updated_at: now,
    _links: {
      app: { href: "" },
      operation: { href: "" },
      ...p._links,
    },
    ...p,
    _type: "deployment",
  };
};

export const deserializeDeployment = (
  payload: DeploymentResponse,
): Deployment => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    dockerImage: payload.docker_image,
    gitRef: payload.git_ref,
    sha: payload.sha,
    config: payload.config,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    appId: extractIdFromLink(links.app),
    operationId: extractIdFromLink(links.operation),
  };
};

export const defaultDeployment = (a: Partial<Deployment> = {}): Deployment => {
  const now = new Date().toISOString();
  return {
    id: "",
    dockerImage: "",
    gitRef: "",
    sha: "",
    config: {},
    createdAt: now,
    updatedAt: now,
    appId: "",
    operationId: "",
    ...a,
  };
};

export const DEPLOYMENT_NAME = "deployments";
const slice = createTable<Deployment>({ name: DEPLOYMENT_NAME });
export const { add: addDeployments } = slice.actions;
export const reducers = createReducerMap(slice);

// const initDeployment = defaultDeployment();
// const must = mustSelectEntity(initDeployment);
const selectors = slice.getSelectors((s: AppState) => s[DEPLOYMENT_NAME]);
export const selectDeploymentsByAppId = createSelector(
  selectors.selectTableAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  (deployments, appId) => {
    return deployments.filter((d) => d.appId === appId);
  },
);

export const fetchDeploymentsByAppId = api.get<{ id: string }>(
  "/apps/:id/deployments",
  function* (ctx, next) {
    const deployments: DeploymentResponse[] = [
      defaultDeploymentResponse({ id: "1" }),
      defaultDeploymentResponse({ id: "2" }),
      defaultDeploymentResponse({ id: "3" }),
    ];
    ctx.response = new Response(JSON.stringify({ _embedded: { deployments } }));
    yield* next();
  },
);
export const rollbackDeployment = api.post<{
  id: string;
  deploymentId: string;
}>(["/apps/:id/operations", "rollback"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      type: "rollback",
      deployment_id: ctx.payload.deploymentId,
    }),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { message: "Rollback initiated" };
});

export const entities = {
  deployment: defaultEntity({
    id: "deployment",
    save: addDeployments,
    deserialize: deserializeDeployment,
  }),
};
