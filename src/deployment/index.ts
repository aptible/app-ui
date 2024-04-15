import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { Deployment, LinkResponse, OperationStatus } from "@app/types";

export interface DeploymentResponse {
  id: string;
  status: string;
  docker_image: string | null;
  docker_repository_url: string | null;
  git_repository_url: string | null;
  git_ref: string | null;
  git_commit_sha: string | null;
  git_commit_url: string | null;
  git_commit_message: string | null;
  git_commit_timestamp: string | null;
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
    status: "",
    docker_image: "",
    docker_repository_url: "",
    git_repository_url: "",
    git_ref: "",
    git_commit_sha: "",
    git_commit_url: "",
    git_commit_message: "",
    git_commit_timestamp: "",
    created_at: now,
    updated_at: now,
    _links: {
      app: defaultHalHref(),
      operation: defaultHalHref(),
      configuration: defaultHalHref(),
      image: defaultHalHref(),
      source: defaultHalHref(),
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
    status: payload.status as OperationStatus,
    dockerImage: payload.docker_image || "",
    dockerRepositoryUrl: payload.docker_repository_url || "",
    gitRepositoryUrl: payload.git_repository_url || "",
    gitRef: payload.git_ref || "",
    gitCommitSha: payload.git_commit_sha || "",
    gitCommitUrl: payload.git_commit_url || "",
    gitCommitMessage: payload.git_commit_message || "",
    gitCommitTimestamp: payload.git_commit_timestamp,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    appId: extractIdFromLink(links.app),
    operationId: extractIdFromLink(links.operation),
    imageId: extractIdFromLink(links.image),
    configurationId: extractIdFromLink(links.configuration),
    sourceId: extractIdFromLink(links.source),
  };
};

export const selectDeploymentById = schema.deployments.selectById;
export const selectDeploymentsAsList = createSelector(
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
  (deployments, sourceId): Deployment[] => {
    return deployments.filter((d) => d.sourceId === sourceId);
  },
);

export function getRegistryParts(url: string): { name: string; tag: string } {
  const [name, tag] = url.split(":");
  return { name, tag };
}

export function getRepoNameFromUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.hostname}${parsed.pathname}`;
}

export function getDockerImageName(deployment: Deployment): string {
  return deployment.dockerImage || "Dockerfile Build";
}

export const fetchDeployments = api.get("/deployments?per_page=5000");
export const fetchDeploymentById = api.get<{ id: string }>("/deployments/:id");
export const fetchDeploymentsByAppId = api.get<{ id: string }>(
  "/apps/:id/deployments",
);

export const entities = {
  deployment: defaultEntity({
    id: "deployment",
    save: schema.deployments.add,
    deserialize: deserializeDeployment,
  }),
};
