import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployRelease, LinkResponse } from "@app/types";
import { selectDeploy } from "../slice";
import { defaultEntity, extractIdFromLink } from "@app/hal";

export interface DeployReleaseResponse {
  id: number;
  docker_ref: string;
  docker_repo: string;
  created_at: string;
  updated_at: string;
  _links: {
    service: LinkResponse;
  };
  _type: "release";
}

export const defaultReleaseResponse = (
  p: Partial<DeployReleaseResponse> = {},
): DeployReleaseResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    docker_ref: "",
    docker_repo: "",
    created_at: now,
    updated_at: now,
    _links: {
      service: { href: "" },
      ...p._links,
    },
    _type: "release",
    ...p,
  };
};

export const deserializeDeployRelease = (
  payload: DeployReleaseResponse,
): DeployRelease => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    dockerRepo: payload.docker_repo,
    dockerRef: payload.docker_ref,
    serviceId: extractIdFromLink(links.service),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const defaultDeployRelease = (
  c: Partial<DeployRelease> = {},
): DeployRelease => {
  const now = new Date().toISOString();
  return {
    id: "",
    dockerRef: "",
    dockerRepo: "",
    createdAt: now,
    updatedAt: now,
    serviceId: "",
  };
};

export const DEPLOY_RELEASE_NAME = "releases";
const slice = createTable<DeployRelease>({
  name: DEPLOY_RELEASE_NAME,
});
const { add: addDeployReleases } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_RELEASE_NAME],
);
const initRelease = defaultDeployRelease();
const must = mustSelectEntity(initRelease);
export const selectReleaseById = must(selectors.selectById);
export const selectReleaseByIds = selectors.selectByIds;
export const { selectTableAsList: selectReleaseAsList } = selectors;
export const releaseReducers = createReducerMap(slice);
export const releaseEntities = {
  permission: defaultEntity({
    id: "release",
    save: addDeployReleases,
    deserialize: deserializeDeployRelease,
  }),
};
