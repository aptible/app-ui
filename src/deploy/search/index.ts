import { selectDeployments } from "@app/deployment";
import { createSelector } from "@app/fx";
import { type WebState, schema } from "@app/schema";
import { selectSourcesAsList } from "@app/source";
import type { DeployServiceRow, DeploySource, Deployment } from "@app/types";
import {
  type DeployAppRow,
  findAppById,
  selectApps,
  selectAppsByOrgAsList,
} from "../app";
import { findBackupsByDatabaseId, selectBackupsAsList } from "../backup";
import { estimateMonthlyCost } from "../cost";
import {
  type DeployDatabaseRow,
  selectDatabasesByOrgAsList,
} from "../database";
import {
  findDatabaseImageById,
  selectDatabaseImages,
} from "../database-images";
import { findDiskById, selectDisks } from "../disk";
import {
  findEndpointsByAppId,
  findEndpointsByServiceId,
  selectEndpointsAsList,
} from "../endpoint";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironments,
  selectEnvironmentsByOrg,
} from "../environment";
import {
  findOperationsByAppId,
  findOperationsByDbId,
  selectOperationsAsList,
} from "../operation";
import {
  calcMetrics,
  findServiceById,
  findServicesByAppId,
  selectServices,
  selectServicesByOrgId,
  serviceCommandText,
} from "../service";

export const selectServicesForTable = createSelector(
  selectEnvironmentsByOrg,
  selectApps,
  selectServicesByOrgId,
  selectEndpointsAsList,
  (envs, apps, services, endpoints) =>
    services
      // making sure we have a valid environment associated with it
      .filter((service) => {
        const env = findEnvById(envs, { id: service.environmentId });
        return hasDeployEnvironment(env);
      })
      // exclude database services since customers only know of them as App Services.
      .filter((service) => service.appId)
      .map((service): DeployServiceRow => {
        const env = findEnvById(envs, { id: service.environmentId });
        let resourceHandle = "";
        if (service.appId) {
          const app = findAppById(apps, { id: service.appId });
          resourceHandle = app.handle;
        } else {
          resourceHandle = "Unknown";
        }

        return {
          ...service,
          envHandle: env.handle,
          resourceHandle,
          cost: estimateMonthlyCost({
            services: [service],
            endpoints: findEndpointsByServiceId(endpoints, service.id),
          }),
        };
      }),
);

const createServiceSortFn = (
  sortBy: keyof DeployServiceRow,
  sortDir: "asc" | "desc",
) => {
  return (a: DeployServiceRow, b: DeployServiceRow) => {
    if (sortBy === "cost") {
      if (sortDir === "asc") {
        return a.cost - b.cost;
      }
      return b.cost - a.cost;
    }

    if (sortBy === "resourceHandle") {
      if (sortDir === "asc") {
        return a.resourceHandle.localeCompare(b.resourceHandle);
      }
      return b.resourceHandle.localeCompare(a.resourceHandle);
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
};

export const selectServicesForTableSearch = createSelector(
  selectServicesForTable,
  (_: WebState, p: { search: string }) => p.search,
  (_: WebState, p: { sortBy: keyof DeployServiceRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (services, search, sortBy, sortDir) => {
    const sortFn = createServiceSortFn(sortBy, sortDir);

    if (search === "") {
      return [...services].sort(sortFn);
    }

    const results = services.filter((service) => {
      const envHandle = service.envHandle.toLocaleLowerCase();
      const resourceHandle = service.resourceHandle.toLocaleLowerCase();
      const id = service.id.toLocaleLowerCase();
      const cmd = serviceCommandText(service).toLocaleLowerCase();

      const idMatch = id.includes(search);
      const envMatch = envHandle !== "" && envHandle.includes(search);
      const resourceHandleMatch =
        resourceHandle !== "" && resourceHandle.includes(search);
      const cmdMatch = cmd.includes(search);

      const searchMatch =
        idMatch || envMatch || resourceHandleMatch || cmdMatch;
      return searchMatch;
    });

    return results.sort(sortFn);
  },
);

export const selectServiceRowsByAppId = createSelector(
  selectServicesForTable,
  (_: WebState, p: { appId: string }) => p.appId,
  (services, appId) => {
    return services.filter((service) => service.appId === appId);
  },
);

export const selectAppsForTable = createSelector(
  selectAppsByOrgAsList,
  selectEnvironments,
  selectOperationsAsList,
  selectServices,
  selectEndpointsAsList,
  selectDeployments,
  (apps, envs, ops, services, endpoints, deployments) =>
    apps
      .map((app): DeployAppRow => {
        const env = findEnvById(envs, { id: app.environmentId });
        const appOps = findOperationsByAppId(ops, app.id);
        const lastOperation = appOps?.[0] || schema.operations.empty;
        const currentDeployment = schema.deployments.findById(deployments, {
          id: app.currentDeploymentId,
        });
        const appServices = findServicesByAppId(
          Object.values(services),
          app.id,
        );
        const cost = estimateMonthlyCost({
          services: appServices,
          endpoints: findEndpointsByAppId(endpoints, services, app.id),
        });
        const metrics = calcMetrics(appServices);

        return {
          ...app,
          ...metrics,
          envHandle: env.handle,
          lastOperation,
          currentDeployment,
          gitRef: currentDeployment.gitRef,
          gitCommitSha: currentDeployment.gitCommitSha,
          dockerImageName: currentDeployment.dockerImage,
          lastDeployed: currentDeployment.createdAt,
          cost,
          totalServices: appServices.length,
        };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle)),
);

const computeSearchMatch = (app: DeployAppRow, search: string): boolean => {
  const gitRef = app.gitRef.toLocaleLowerCase();
  const gitCommitSha = app.gitCommitSha.toLocaleLowerCase();
  const dockerImageName = app.dockerImageName.toLocaleLowerCase();
  const handle = app.handle.toLocaleLowerCase();
  const envHandle = app.envHandle.toLocaleLowerCase();

  let lastOpUser = "";
  let lastOpType = "";
  let lastOpStatus = "";
  if (app.lastOperation) {
    lastOpUser = app.lastOperation.userName.toLocaleLowerCase();
    lastOpType = app.lastOperation.type.toLocaleLowerCase();
    lastOpStatus = app.lastOperation.status.toLocaleLowerCase();
  }

  const gitRefMatch = gitRef.includes(search);
  const gitCommitShaMatch = gitCommitSha.includes(search);
  const dockerImageNameMatch = dockerImageName.includes(search);
  const handleMatch = handle.includes(search);
  const envMatch = envHandle.includes(search);
  const userMatch = lastOpUser !== "" && lastOpUser.includes(search);
  const opMatch = lastOpType !== "" && lastOpType.includes(search);
  const opStatusMatch = lastOpStatus !== "" && lastOpStatus.includes(search);
  const idMatch = search === app.id;

  return (
    gitRefMatch ||
    gitCommitShaMatch ||
    dockerImageNameMatch ||
    handleMatch ||
    envMatch ||
    opMatch ||
    opStatusMatch ||
    userMatch ||
    idMatch
  );
};

const createAppSortFn = (
  sortBy: keyof DeployAppRow,
  sortDir: "asc" | "desc",
) => {
  return (a: DeployAppRow, b: DeployAppRow) => {
    if (sortBy === "cost") {
      if (sortDir === "asc") {
        return a.cost - b.cost;
      }
      return b.cost - a.cost;
    }

    if (sortBy === "handle") {
      if (sortDir === "asc") {
        return a.handle.localeCompare(b.handle);
      }
      return b.handle.localeCompare(a.handle);
    }

    if (sortBy === "gitRef") {
      const aRefOrSha = [a.gitRef, a.gitCommitSha].join("@");
      const bRefOrSha = [b.gitRef, b.gitCommitSha].join("@");
      if (sortDir === "asc") {
        return aRefOrSha.localeCompare(bRefOrSha);
      }
      return bRefOrSha.localeCompare(aRefOrSha);
    }

    if (sortBy === "dockerImageName") {
      if (sortDir === "asc") {
        return a.dockerImageName.localeCompare(b.dockerImageName);
      }
      return b.dockerImageName.localeCompare(a.dockerImageName);
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    }

    if (sortBy === "totalServices") {
      if (sortDir === "asc") {
        return a.totalServices - b.totalServices;
      }
      return b.totalServices - a.totalServices;
    }

    if (sortBy === "envHandle") {
      if (sortDir === "asc") {
        return a.envHandle.localeCompare(b.envHandle);
      }
      return b.envHandle.localeCompare(a.envHandle);
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
};

export const selectAppsForTableSearchByEnvironmentId = createSelector(
  selectAppsForTable,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, props: { envId?: string }) => props.envId || "",
  (_: WebState, p: { sortBy: keyof DeployAppRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (apps, search, envId, sortBy, sortDir): DeployAppRow[] => {
    const sortFn = createAppSortFn(sortBy, sortDir);

    if (search === "" && envId === "") {
      return [...apps].sort(sortFn);
    }

    const results = apps.filter((app) => {
      const searchMatch = computeSearchMatch(app, search);
      const envIdMatch = envId !== "" && app.environmentId === envId;

      if (envId !== "") {
        if (search !== "") {
          return envIdMatch && searchMatch;
        }

        return envIdMatch;
      }

      return searchMatch;
    });

    return results.sort(sortFn);
  },
);

export const selectAppsForTableSearch = createSelector(
  selectAppsForTable,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, p: { sortBy: keyof DeployAppRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (apps, search, sortBy, sortDir): DeployAppRow[] => {
    const sortFn = createAppSortFn(sortBy, sortDir);

    if (search === "") {
      return [...apps].sort(sortFn);
    }

    return apps.filter((app) => computeSearchMatch(app, search)).sort(sortFn);
  },
);

export const selectAppsForTableSearchBySourceId = createSelector(
  selectAppsForTable,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, props: { sourceId: string }) => props.sourceId,
  (_: WebState, p: { sortBy: keyof DeployAppRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (apps, search, sourceId, sortBy, sortDir): DeployAppRow[] => {
    const sortFn = createAppSortFn(sortBy, sortDir);

    if (search === "" && sourceId === "") {
      return [...apps].sort(sortFn);
    }

    const results = apps.filter((app) => {
      const searchMatch = computeSearchMatch(app, search);
      const sourceIdMatch = sourceId !== "" && app.currentSourceId === sourceId;

      if (sourceId !== "") {
        if (search !== "") {
          return sourceIdMatch && searchMatch;
        }

        return sourceIdMatch;
      }

      return searchMatch;
    });

    return results.sort(sortFn);
  },
);

export interface GitCommit {
  sha: string;
  ref: string;
  message: string;
  date: string | null;
  url: string;
}

export interface DeploySourceRow extends DeploySource {
  apps: DeployAppRow[];
  deployments: Deployment[];
  liveCommits: GitCommit[];
}

export const selectSourcesForTable = createSelector(
  selectSourcesAsList,
  selectAppsForTable,
  (sources, apps) =>
    sources.map<DeploySourceRow>((source) => {
      const sourceApps = apps.filter(
        (app) => app.currentSourceId === source.id,
      );
      const sourceDeployments = sourceApps.map((app) => app.currentDeployment);
      const distinctCommits = sourceDeployments.reduce<
        Record<string, GitCommit>
      >((commits, deployment) => {
        const sha = deployment.gitCommitSha;

        if (!sha || Object.hasOwn(commits, sha)) {
          return commits;
        }

        commits[sha] = {
          sha,
          ref: deployment.gitRef,
          message: deployment.gitCommitMessage,
          date: deployment.gitCommitTimestamp,
          url: deployment.gitCommitUrl,
        };

        return commits;
      }, {});
      const liveCommits = Object.values(distinctCommits).sort((a, b) => {
        if (!a.date || !b.date) {
          return 0;
        }

        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return {
        ...source,
        apps: sourceApps,
        deployments: sourceDeployments,
        liveCommits,
      };
    }),
);

export const selectSourcesForTableSearch = createSelector(
  selectSourcesForTable,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, p: { sortBy: keyof DeploySourceRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (sources, search, sortBy, sortDir) => {
    const sortFn = (a: DeploySourceRow, b: DeploySourceRow) => {
      const left = (sortDir === "asc" ? a : b)[sortBy];
      const right = (sortDir === "asc" ? b : a)[sortBy];

      if (sortBy === "liveCommits") {
        return left.length - right.length;
      }

      if (sortBy === "apps") {
        return left.length - right.length;
      }

      if (sortBy === "displayName") {
        return (<string>left).localeCompare(<string>right);
      }

      return 0;
    };

    if (search === "") {
      return [...sources].sort(sortFn);
    }

    const results = sources.filter((source) => {
      return source.displayName.includes(search);
    });

    return results.sort(sortFn);
  },
);

const selectSearchProp = (_: WebState, props: { search: string }) =>
  props.search.toLocaleLowerCase();

const computeSearchMatchDb = (
  db: DeployDatabaseRow,
  search: string,
): boolean => {
  const handle = db.handle.toLocaleLowerCase();
  const envHandle = db.envHandle.toLocaleLowerCase();
  const dbType = db.type.toLocaleLowerCase();
  const dbImage = db.imageDesc.toLocaleLowerCase();

  let lastOpUser = "";
  let lastOpType = "";
  let lastOpStatus = "";
  if (db.lastOperation) {
    lastOpUser = db.lastOperation.userName.toLocaleLowerCase();
    lastOpType = db.lastOperation.type.toLocaleLowerCase();
    lastOpStatus = db.lastOperation.status.toLocaleLowerCase();
  }

  const handleMatch = handle.includes(search);
  const envMatch = envHandle.includes(search);
  const userMatch = lastOpUser !== "" && lastOpUser.includes(search);
  const opMatch = lastOpType !== "" && lastOpType.includes(search);
  const opStatusMatch = lastOpStatus !== "" && lastOpStatus.includes(search);
  const dbTypeMatch = dbType.includes(search);
  const imgDescMatch = dbImage.includes(search);
  const idMatch = search === db.id;

  return (
    handleMatch ||
    imgDescMatch ||
    dbTypeMatch ||
    envMatch ||
    opMatch ||
    opStatusMatch ||
    userMatch ||
    idMatch
  );
};

const createDatabaseSortFn = (
  sortBy: keyof DeployDatabaseRow,
  sortDir: "asc" | "desc",
) => {
  return (a: DeployDatabaseRow, b: DeployDatabaseRow) => {
    if (sortBy === "cost") {
      if (sortDir === "asc") {
        return a.cost - b.cost;
      }
      return b.cost - a.cost;
    }

    if (sortBy === "handle") {
      if (sortDir === "asc") {
        return a.handle.localeCompare(b.handle);
      }
      return b.handle.localeCompare(a.handle);
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    }

    if (sortBy === "diskSize") {
      if (sortDir === "asc") {
        return a.diskSize - b.diskSize;
      }
      return b.diskSize - a.diskSize;
    }

    if (sortBy === "containerSize") {
      if (sortDir === "asc") {
        return a.containerSize - b.containerSize;
      }
      return b.containerSize - a.containerSize;
    }

    if (sortBy === "envHandle") {
      if (sortDir === "asc") {
        return a.envHandle.localeCompare(b.envHandle);
      }
      return b.envHandle.localeCompare(a.envHandle);
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
};

export const selectDatabasesForTable = createSelector(
  selectDatabasesByOrgAsList,
  selectEnvironments,
  selectOperationsAsList,
  selectDisks,
  selectServices,
  selectEndpointsAsList,
  selectBackupsAsList,
  selectDatabaseImages,
  (dbs, envs, ops, disks, services, endpoints, backups, images) =>
    dbs
      .map((dbb): DeployDatabaseRow => {
        const env = findEnvById(envs, { id: dbb.environmentId });
        const dbOps = findOperationsByDbId(ops, dbb.id);
        let lastOperation = schema.operations.empty;
        if (dbOps.length > 0) {
          lastOperation = dbOps[0];
        }
        const disk = findDiskById(disks, { id: dbb.diskId });
        const service = findServiceById(services, { id: dbb.serviceId });
        const cost = estimateMonthlyCost({
          services: [service],
          disks: [disk],
          endpoints: findEndpointsByServiceId(endpoints, service.id),
          backups: findBackupsByDatabaseId(backups, dbb.id),
        });
        const metrics = calcMetrics([service]);
        const img = findDatabaseImageById(images, { id: dbb.databaseImageId });
        return {
          ...dbb,
          imageDesc: img.description,
          envHandle: env.handle,
          lastOperation,
          diskSize: disk.size,
          cost,
          containerSize: metrics.totalMemoryLimit / 1024,
        };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle)),
);

export const selectDatabasesForTableSearch = createSelector(
  selectDatabasesForTable,
  selectSearchProp,
  (_: WebState, p: { sortBy: keyof DeployDatabaseRow }) => p.sortBy,
  (_: WebState, p: { sortDir: "asc" | "desc" }) => p.sortDir,
  (dbs, search, sortBy, sortDir): DeployDatabaseRow[] => {
    const sortFn = createDatabaseSortFn(sortBy, sortDir);
    if (search === "") {
      return [...dbs].sort(sortFn);
    }

    return dbs.filter((db) => computeSearchMatchDb(db, search)).sort(sortFn);
  },
);

export const selectDatabasesForTableSearchByEnvironmentId = createSelector(
  selectDatabasesForTable,
  selectSearchProp,
  (_: WebState, props: { envId?: string }) => props.envId || "",
  (dbs, search, envId): DeployDatabaseRow[] => {
    if (search === "" && envId === "") {
      return dbs;
    }

    return dbs.filter((db) => {
      const searchMatch = computeSearchMatchDb(db, search);
      const envIdMatch = envId !== "" && db.environmentId === envId;

      if (envId !== "") {
        if (search !== "") {
          return envIdMatch && searchMatch;
        }

        return envIdMatch;
      }

      return searchMatch;
    });
  },
);
