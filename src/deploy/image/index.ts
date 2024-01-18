import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type { DeployImage } from "@app/types";

export interface DeployImageResponse {
  id: number;
  docker_ref: string | null;
  docker_repo: string | null;
  git_ref: string | null;
  git_repo: string | null;
  updated_at: string;
  created_at: string;
  exposed_ports: number[];
  _type: "image";
}

export const deserializeImage = (payload: DeployImageResponse): DeployImage => {
  if (!payload) {
    return schema.images.empty;
  }

  return {
    dockerRef: payload.docker_ref || "",
    dockerRepo: payload.docker_repo || "",
    gitRef: payload.git_ref || "Not used",
    gitRepo: payload.git_repo || "",
    exposedPorts: payload.exposed_ports,
    id: `${payload.id}`,
    updatedAt: payload.updated_at,
    createdAt: payload.created_at,
  };
};

export const fetchImageById = api.get<{ id: string }>("/images/:id");

export const selectImageById = schema.images.selectById;

export const imageEntities = {
  image: defaultEntity({
    id: "image",
    save: schema.images.add,
    deserialize: deserializeImage,
  }),
};
