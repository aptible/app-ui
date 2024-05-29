import { api, cacheTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type { DeployDatabaseImage } from "@app/types";

export interface DeployDatabaseImageResponse {
  id: number;
  default: boolean;
  description: string;
  discoverable: boolean;
  docker_repo: string;
  type: string;
  version: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
  _type: "database_image";
}

export const defaultDatabaseImageResponse = (
  i: Partial<DeployDatabaseImageResponse> = {},
): DeployDatabaseImageResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    default: true,
    description: "",
    discoverable: true,
    docker_repo: "",
    type: "",
    version: "",
    visible: true,
    created_at: now,
    updated_at: now,
    _type: "database_image",
    ...i,
  };
};

export const deserializeDeployDatabaseImage = (
  payload: DeployDatabaseImageResponse,
): DeployDatabaseImage => {
  return {
    id: `${payload.id}`,
    default: payload.default,
    description: payload.description,
    discoverable: payload.discoverable,
    dockerRepo: payload.docker_repo,
    type: payload.type,
    version: payload.version,
    visible: payload.visible,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const hasDeployDatabaseImage = (a: DeployDatabaseImage) => a.id !== "";
export const selectDatabaseImageById = schema.databaseImages.selectById;
export const selectDatabaseImagesAsList = createSelector(
  schema.databaseImages.selectTableAsList,
  (imgs) =>
    [...imgs].sort((a, b) => {
      return b.description.localeCompare(a.description, "en", {
        numeric: true,
      });
    }),
);
export const selectDatabaseImagesVisible = createSelector(
  selectDatabaseImagesAsList,
  (images) => images.filter((img) => img.visible),
);

export const fetchDatabaseImages = api.get("/database_images?per_page=5000", {
  supervisor: cacheTimer(),
});

export const databaseImageEntities = {
  database_image: defaultEntity({
    id: "database_image",
    deserialize: deserializeDeployDatabaseImage,
    save: schema.databaseImages.add,
  }),
};
