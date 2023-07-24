import type { DeployImage } from "@app/types";

interface DeployImageResponse {
  id: number;
  docker_ref: string | null;
  docker_repo: string | null;
  git_ref: string | null;
  git_repo: string | null;
  updated_at: string;
  created_at: string;
  exposed_ports: number[];
}

export const deserializeImage = (payload: DeployImageResponse): DeployImage => {
  if (!payload) {
    return defaultDeployImage();
  }

  return {
    dockerRef: payload.docker_ref || "",
    dockerRepo: payload.docker_repo || "",
    gitRef: payload.git_ref || "",
    gitRepo: payload.git_repo || "",
    exposedPorts: payload.exposed_ports,
    id: `${payload.id}`,
    updatedAt: payload.updated_at,
    createdAt: payload.created_at,
  };
};

export const defaultDeployImage = (
  img: Partial<DeployImage> = {},
): DeployImage => {
  const now = new Date().toISOString();
  return {
    id: "",
    gitRepo: "",
    gitRef: "",
    dockerRepo: "",
    exposedPorts: [],
    dockerRef: "",
    createdAt: now,
    updatedAt: now,
    ...img,
  };
};
