import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployRelease, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

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
  r: Partial<DeployRelease> = {},
): DeployRelease => {
  const now = new Date().toISOString();
  return {
    id: "",
    dockerRef: "",
    dockerRepo: "",
    createdAt: now,
    updatedAt: now,
    serviceId: "",
    ...r,
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
export const selectReleasesByService = createSelector(
  selectReleaseAsList,
  (_: AppState, p: { serviceId: string }) => p.serviceId,
  (releases, serviceId) => {
    return releases
      .filter((release) => release.serviceId === serviceId)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  },
);

export const selectReleasesByServiceAfterDate = createSelector(
  selectReleaseAsList,
  (_: AppState, p: { date: string }) => p.date,
  (_: AppState, p: { serviceId: string }) => p.serviceId,
  (releases, date, serviceId) => {
    const filteredReleases = releases
      .filter((release) => release.serviceId === serviceId)
      .sort((a, b) => {
        // sort the releases, so we can get all of them + 1 in reverse
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    const result: DeployRelease[] = [];
    for (const release of filteredReleases) {
      if (release.createdAt > date) {
        result.push(release);
      } else if (release.createdAt <= date) {
        result.push(release);
        break;
      }
    }
    return result;
  },
);

export const fetchRelease = api.get<{ id: string }>("/releases/:id");
export const fetchReleasesByServiceWithDeleted = api.get<{ serviceId: string }>(
  "/services/:serviceId/releases/?with_deleted=true",
);

export const releaseEntities = {
  release: defaultEntity({
    id: "release",
    save: addDeployReleases,
    deserialize: deserializeDeployRelease,
  }),
};
