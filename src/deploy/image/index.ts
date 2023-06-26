import type { DeployImage } from "@app/types";

export const deserializeImage = (payload: any): DeployImage | null => {
  if (!payload) {
    return null;
  }
  return {
    dockerRef: payload.docker_ref,
    dockerRepo: payload.docker_repo,
    gitRef: payload.git_ref,
    gitRepo: payload.git_repo,
    id: payload.id,
    updatedAt: payload.updated_at,
    createdAt: payload.created_at,
  };
};

export const defaultDeployImage = (img: Partial<DeployImage>): DeployImage => {
  const now = new Date().toISOString();
  return {
    id: "",
    gitRepo: "",
    gitRef: "",
    dockerRepo: "",
    dockerRef: "",
    createdAt: now,
    updatedAt: now,
    ...img,
  };
};
