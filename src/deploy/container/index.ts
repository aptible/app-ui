import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import {
  AppState,
  DeployContainer,
  HalEmbedded,
  LinkResponse,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export interface DeployContainerResponse {
  id: number;
  aws_instance_id: string;
  created_at: string;
  docker_name: string;
  host: string;
  instance_class: string;
  layer: string;
  memory_limit: number;
  port: number;
  port_mapping: number[][];
  status: string;
  updated_at: string;
  _links: {
    release: LinkResponse;
  };
  _type: "container";
}

export const defaultContainerResponse = (
  c: Partial<DeployContainerResponse> = {},
): DeployContainerResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    aws_instance_id: "",
    docker_name: "",
    host: "",
    instance_class: "",
    layer: "",
    memory_limit: 0,
    port: 0,
    port_mapping: [],
    status: "",
    created_at: now,
    updated_at: now,
    _links: {
      release: { href: "" },
      ...c._links,
    },
    _type: "container",
    ...c,
  };
};

export const deserializeDeployContainer = (
  payload: DeployContainerResponse,
): DeployContainer => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    awsInstanceId: payload.aws_instance_id,
    dockerName: payload.docker_name,
    host: payload.host,
    layer: payload.layer,
    memoryLimit: payload.memory_limit,
    port: payload.port,
    portMapping: payload.port_mapping,
    status: payload.status,
    releaseId: extractIdFromLink(links.release),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const defaultDeployContainer = (
  c: Partial<DeployContainer> = {},
): DeployContainer => {
  const now = new Date().toISOString();
  return {
    id: "",
    awsInstanceId: "",
    dockerName: "",
    host: "",
    layer: "",
    memoryLimit: 0,
    port: 0,
    portMapping: [],
    status: "",
    createdAt: now,
    updatedAt: now,
    releaseId: "",
    ...c,
  };
};

export const DEPLOY_CONTAINER_NAME = "containers";
const slice = createTable<DeployContainer>({
  name: DEPLOY_CONTAINER_NAME,
});
const { add: addDeployContainers } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_CONTAINER_NAME],
);
const initContainer = defaultDeployContainer();
const must = mustSelectEntity(initContainer);
export const selectContainerById = must(selectors.selectById);
export const selectContainerByIds = selectors.selectByIds;
export const { selectTableAsList: selectContainerAsList } = selectors;
export const containerReducers = createReducerMap(slice);

export const selectContainersByReleaseId = createSelector(
  selectContainerAsList,
  (_: AppState, props: { releaseId: string }) => props.releaseId,
  (containers, releaseId) => {
    return containers.filter((container) => container.releaseId === releaseId);
  },
);

export const fetchContainersByReleaseId = api.get<
  { releaseId: string },
  HalEmbedded<{ containers: DeployContainerResponse[] }>
>("/releases/:releaseId/containers");

export const containerEntities = {
  container: defaultEntity({
    id: "container",
    save: addDeployContainers,
    deserialize: deserializeDeployContainer,
  }),
};
