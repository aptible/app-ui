import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { DeployRelease, LinkResponse } from "@app/types";

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

export const selectReleaseById = schema.releases.selectById;
export const selectReleaseByIds = schema.releases.selectByIds;
export const selectReleaseAsList = schema.releases.selectTableAsList;
export const selectReleasesByService = createSelector(
  selectReleaseAsList,
  (_: WebState, p: { serviceId: string }) => p.serviceId,
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
  (_: WebState, p: { date: string }) => p.date,
  (_: WebState, p: { serviceId: string }) => p.serviceId,
  (releases, date, serviceId) => {
    const filteredReleases = releases
      .filter((release) => release.serviceId === serviceId)
      .sort((a, b) => {
        // sort the releases, so we can get all of them + 1 in reverse and break early
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
    // sort forwards to retain consistency
    return result.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
);

export const fetchRelease = api.get<{ id: string }>("/releases/:id");
export const fetchReleasesByServiceWithDeleted = api.get<{ serviceId: string }>(
  "/services/:serviceId/releases/?with_deleted=true",
);

export const releaseEntities = {
  release: defaultEntity({
    id: "release",
    save: schema.releases.add,
    deserialize: deserializeDeployRelease,
  }),
};
