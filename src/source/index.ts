import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { db } from "@app/schema";
import { DeploySource, SourceDeploymentMethod } from "@app/types";

interface DeploySourceResponse {
  id: string;
  display_name: string;
  deployment_method: SourceDeploymentMethod;
  git_url: string | null;
  git_browse_url: string | null;
  docker_url: string | null;
  docker_browse_url: string | null;
  created_at: string;
  updated_at: string;
  _type: "source";
}

export const defaultDeploySourceResponse = (
  r: Partial<DeploySourceResponse> = {},
): DeploySourceResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    display_name: "",
    deployment_method: "unknown",
    git_browse_url: "",
    docker_browse_url: "",
    docker_url: "",
    git_url: "",
    created_at: now,
    updated_at: now,
    ...r,
    _type: "source",
  };
};

const deserializeDeploySource = (r: DeploySourceResponse): DeploySource => {
  return {
    id: r.id,
    displayName: r.display_name || "Unknown",
    gitUrl: r.git_url || "",
    gitBrowseUrl: r.git_browse_url || "",
    dockerUrl: r.docker_url || "",
    dockerBrowseUrl: r.docker_browse_url || "",
    deploymentMethod: r.deployment_method,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const hasDeploySource = (a: DeploySource) => a.id !== "";

export const selectSourceById = db.sources.selectById;
export const selectSourcesAsList = db.sources.selectTableAsList;

export const entities = {
  source: defaultEntity({
    id: "source",
    save: db.sources.add,
    deserialize: deserializeDeploySource,
  }),
};

export const fetchSources = api.get("/sources");

export const fetchSourceById = api.get<{ id: string }>("/sources/:id");

export const updateSource = api.patch<{ id: string; gitBrowseUrl: string }>(
  "/sources/:id",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ git_browse_url: ctx.payload.gitBrowseUrl }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Successfully updated source!" };
  },
);

export function getSourceImg(source: DeploySource) {
  if (source.deploymentMethod === "git") return "logo-git.png";
  if (source.deploymentMethod === "docker") return "logo-docker.png";
  return "logo-docker.png";
}
