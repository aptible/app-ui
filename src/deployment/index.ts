import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { Deployment, LinkResponse } from "@app/types";

export interface DeploymentResponse {
  id: string;
  status: string;
  docker_image: string;
  git_repository_url: string;
  git_ref: string;
  git_commit_sha: string;
  git_commit_url: string;
  git_commit_message: string;
  created_at: string;
  updated_at: string;
  _links: {
    app: LinkResponse;
    operation: LinkResponse;
    configuration: LinkResponse;
    image: LinkResponse;
  };
  _type: "deployment";
}

export const defaultDeploymentResponse = (
  p: Partial<DeploymentResponse> = {},
): DeploymentResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    status: "",
    docker_image: "",
    git_repository_url: "",
    git_ref: "",
    git_commit_sha: "",
    git_commit_url: "",
    git_commit_message: "",
    created_at: now,
    updated_at: now,
    _links: {
      app: defaultHalHref(),
      operation: defaultHalHref(),
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
    dockerImage: payload.docker_image,
    status: payload.status,
    gitRepositoryUrl: payload.git_repository_url,
    gitRef: payload.git_ref,
    gitCommitSha: payload.git_commit_sha,
    gitCommitUrl: payload.git_commit_url,
    gitCommitMessage: payload.git_commit_message,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    appId: extractIdFromLink(links.app),
    operationId: extractIdFromLink(links.operation),
    imageId: extractIdFromLink(links.image),
    configurationId: extractIdFromLink(links.configuration),
  };
};

export const selectDeploymentById = schema.deployments.selectById;
const selectDeploymentsAsList = createSelector(
  schema.deployments.selectTableAsList,
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

const mockDeployments = [
  defaultDeploymentResponse({
    id: "1",
    docker_image: "",
    git_repository_url: "https://github.com/aptible/app-ui",
    git_ref: "v3",
    git_commit_message: "fix(backup): pass page to fetch request (#754)",
    git_commit_sha: "a947a95a92e7a7a4db7fe01c28346281c128b859",
    git_commit_url:
      "https://github.com/aptible/app-ui/commit/a947a95a92e7a7a4db7fe01c28346281c128b859",
    _links: {
      app: defaultHalHref("https://api.aptible.com/apps/19"),
      operation: defaultHalHref("https://api.aptible.com/operations/1397"),
      configuration: defaultHalHref(),
      image: defaultHalHref(),
    },
  }),
];

export const fetchDeploymentById = api.get<{ id: string }>("/deployments/:id");

export const fetchDeploymentsByAppId = api.get<{ id: string }>(
  "/apps/:id/deployments",
  function* (ctx, next) {
    ctx.response = new Response(
      JSON.stringify({ _embedded: { deployments: mockDeployments } }),
    );
    yield* next();
  },
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
    save: schema.deployments.add,
    deserialize: deserializeDeployment,
  }),
};
