import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, db } from "@app/schema";
import { Deployment, LinkResponse } from "@app/types";

export interface DeploymentResponse {
  id: string;
  modified_env_keys: string[];
  docker_tag: string;
  git_head: string;
  docker_sha: string;
  git_sha: string;
  created_at: string;
  updated_at: string;
  _links: {
    app: LinkResponse;
    operation: LinkResponse;
    configuration: LinkResponse;
    image: LinkResponse;
    source: LinkResponse;
  };
  _type: "deployment";
}

export const defaultDeploymentResponse = (
  p: Partial<DeploymentResponse> = {},
): DeploymentResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    modified_env_keys: [],
    docker_tag: "",
    git_head: "",
    docker_sha: "",
    git_sha: "",
    created_at: now,
    updated_at: now,
    _links: {
      app: defaultHalHref(),
      operation: defaultHalHref(),
      source: defaultHalHref(),
      configuration: defaultHalHref(),
      image: defaultHalHref(),
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
    modifiedEnvKeys: payload.modified_env_keys,
    dockerTag: payload.docker_tag,
    dockerSha: payload.docker_sha,
    gitHead: payload.git_head,
    gitSha: payload.git_sha,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    appId: extractIdFromLink(links.app),
    operationId: extractIdFromLink(links.operation),
    imageId: extractIdFromLink(links.image),
    configurationId: extractIdFromLink(links.configuration),
    sourceId: extractIdFromLink(links.source),
  };
};

export const selectDeploymentById = db.deployments.selectById;
const selectDeploymentsAsList = createSelector(
  db.deployments.selectTableAsList,
  (deployments) =>
    deployments.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }),
);
export const selectDeploymentsByAppId = createSelector(
  selectDeploymentsAsList,
  (_: WebState, p: { appId: string }) => p.appId,
  (deployments, appId) => {
    return deployments.filter((d) => d.appId === appId);
  },
);
export const selectDeploymentsBySourceId = createSelector(
  selectDeploymentsAsList,
  (_: WebState, p: { sourceId: string }) => p.sourceId,
  (deployments, sourceId) => {
    return deployments.filter((d) => d.appId === sourceId);
  },
);

export const fetchDeploymentById = api.get<{ id: string }>("/deployments/:id");

export const fetchDeploymentsByAppId = api.get<{ id: string }>(
  "/apps/:id/deployments",
);
export const fetchDeploymentsBySourceId = api.get<{ id: string }>(
  "/sources/:id/deployments",
);

export const rollbackDeployment = api.post<{
  envId: string;
  appId: string;
  deploymentId: string;
}>(["/apps/:appId/operations", "rollback"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      type: "deploy",
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
    save: db.deployments.add,
    deserialize: deserializeDeployment,
  }),
};
