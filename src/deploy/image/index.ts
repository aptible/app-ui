import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { AppState, DeployImage } from "@app/types";
import { selectDeploy } from "../slice";

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
    return defaultDeployImage();
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

export const defaultDeployImage = (
  img: Partial<DeployImage> = {},
): DeployImage => {
  const now = new Date().toISOString();
  return {
    id: "",
    gitRepo: "",
    gitRef: "Not used",
    dockerRepo: "",
    exposedPorts: [],
    dockerRef: "",
    createdAt: now,
    updatedAt: now,
    ...img,
  };
};

export const fetchImageById = api.get<{ id: string }>("/images/:id");

export const IMAGE_NAME = "images";
const slice = createTable<DeployImage>({ name: IMAGE_NAME });
const { add: addDeployImages } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[IMAGE_NAME] || {},
);
const initImage = defaultDeployImage();
const must = mustSelectEntity(initImage);
export const selectImageById = must(selectors.selectById);

export const imageReducers = createReducerMap(slice);
export const imageEntities = {
  image: defaultEntity({
    id: "image",
    save: addDeployImages,
    deserialize: deserializeImage,
  }),
};
