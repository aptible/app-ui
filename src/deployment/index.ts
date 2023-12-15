import { api } from "@app/api";
import { selectEnv } from "@app/env";
import { select } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
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

const initDeployment = defaultDeployment();
const must = mustSelectEntity(initDeployment);
const selectors = slice.getSelectors((s: AppState) => s[DEPLOYMENT_NAME]);
export const selectDeploymentById = must(selectors.selectById);
const selectDeploymentsAsList = createSelector(
  selectors.selectTableAsList,
  (deployments) =>
    deployments.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }),
);
export const selectDeploymentsByAppId = createSelector(
  selectDeploymentsAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  (deployments, appId) => {
    return deployments.filter((d) => d.appId === appId);
  },
);

function* mockDeployments() {
  const env = yield* select(selectEnv);
  const deployments: DeploymentResponse[] = [
    defaultDeploymentResponse({
      id: "1",
      docker_image: "quay.io/aptible/cloud-ui:v154",
      git_ref: "",
      sha: "45d25efd1d8e",
      config: {},
      _links: {
        app: defaultHalHref(`${env.apiUrl}/apps/54710`),
        operation: defaultHalHref(`${env.apiUrl}/operations/61601979`),
      },
    }),
    defaultDeploymentResponse({
      id: "2",
      docker_image: "quay.io/aptible/cloud-ui:v155",
      git_ref: "",
      sha: "bdad93b96168",
      config: {},
      _links: {
        app: defaultHalHref(`${env.apiUrl}/apps/54710`),
        operation: defaultHalHref(`${env.apiUrl}/operations/61621085`),
      },
    }),
    defaultDeploymentResponse({
      id: "3",
      docker_image: "quay.io/aptible/cloud-ui:v156",
      git_ref: "",
      sha: "144f31026c89",
      config: {},
      _links: {
        app: defaultHalHref(`${env.apiUrl}/apps/54710`),
        operation: defaultHalHref(`${env.apiUrl}/operations/61668999`),
      },
    }),
  ];
  return deployments;
}

export const fetchDeploymentById = api.get<{ id: string }>(
  "/deployments/:id",
  function* (ctx, next) {
    const deployments = yield* mockDeployments();
    const deployment = deployments.find((d) => d.id === ctx.payload.id);
    ctx.response = new Response(JSON.stringify(deployment));
    yield* next();
  },
);

export const fetchDeploymentsByAppId = api.get<{ id: string }>(
  "/apps/:id/deployments",
  function* (ctx, next) {
    const deployments = yield* mockDeployments();
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
