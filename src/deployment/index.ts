import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { prettyGitSha } from "@app/string-utils";
import { Deployment, LinkResponse } from "@app/types";

export interface DeploymentResponse {
  id: string;
  status: string;
  docker_image: string;
  docker_repository_url: string;
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
    docker_repository_url: "",
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
    dockerRepositoryUrl: payload.docker_repository_url,
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

export function getRegistryParts(url: string): { name: string; tag: string } {
  const [name, tag] = url.split(":");
  return { name, tag };
}

export function getTagText(deployment: Deployment): string {
  if (deployment.dockerImage) {
    return getRegistryParts(deployment.dockerImage).tag;
  }

  if (deployment.gitRef) {
    return `${deployment.gitRef} (${prettyGitSha(deployment.gitCommitSha)})`;
  }

  return deployment.gitCommitSha;
}

export function getRepoNameFromUrl(url: string): string {
  return url.replace("https://", "") || "unknown";
}

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
  defaultDeploymentResponse({
    id: "2",
    docker_image: "",
    git_repository_url: "https://github.com/aptible/app-ui",
    git_ref: "v2",
    git_commit_message: "fix(elevate): only permit local redirects (#757)",
    git_commit_sha: "830d3c0866df582b6db0290f97d02123f762b9c3",
    git_commit_url:
      "https://github.com/aptible/app-ui/commit/830d3c0866df582b6db0290f97d02123f762b9c3",
    _links: {
      app: defaultHalHref("https://api.aptible.com/apps/19"),
      operation: defaultHalHref("https://api.aptible.com/operations/1397"),
      configuration: defaultHalHref(),
      image: defaultHalHref(),
    },
  }),
  defaultDeploymentResponse({
    id: "3",
    docker_image: "quay.io/aptible/cloud-ui:latest",
    docker_repository_url: "https://quay.io/repository/aptible/cloud-ui",
    git_repository_url: "https://github.com/aptible/app-ui",
    git_ref: "v1",
    git_commit_message: "chore: make databases column name plural (#753)",
    git_commit_sha: "0ee984d4260aa5e50e32d2a701859b4886e3557b",
    git_commit_url:
      "https://github.com/aptible/app-ui/commit/0ee984d4260aa5e50e32d2a701859b4886e3557b",
    _links: {
      app: defaultHalHref("https://api.aptible.com/apps/19"),
      operation: defaultHalHref("https://api.aptible.com/operations/1397"),
      configuration: defaultHalHref(),
      image: defaultHalHref(),
    },
  }),
];
console.log(mockDeployments);

export const fetchDeploymentById = api.get<{ id: string }>(
  "/deployments/:id",
  function* (ctx, next) {
    ctx.response = new Response(
      JSON.stringify(mockDeployments.find((d) => d.id === ctx.payload.id)),
    );
    yield* next();
  },
);

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
