import { WebState, schema } from "@app/schema";
import { DeployServiceRow } from "@app/types";
import { createSelector } from "starfx";
import {
  DeployAppRow,
  findAppById,
  selectApps,
  selectAppsByOrgAsList,
} from "../app";
import { DeployDatabaseRow, selectDatabasesForTable } from "../database";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironments,
  selectEnvironmentsByOrg,
} from "../environment";
import { findOperationsByAppId, selectOperationsAsList } from "../operation";
import {
  calcMetrics,
  calcServiceMetrics,
  selectServicesAsList,
  selectServicesByOrgId,
  serviceCommandText,
} from "../service";

export const selectServicesForTable = createSelector(
  selectEnvironmentsByOrg,
  selectApps,
  selectServicesByOrgId,
  (envs, apps, services) =>
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

        const metrics = calcServiceMetrics(service);
        return {
          ...service,
          envHandle: env.handle,
          resourceHandle,
          cost: (metrics.estimatedCostInDollars * 1024) / 1000,
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
      } else {
        return b.cost - a.cost;
      }
    }

    if (sortBy === "resourceHandle") {
      if (sortDir === "asc") {
        return a.resourceHandle.localeCompare(b.resourceHandle);
      } else {
        return b.resourceHandle.localeCompare(a.resourceHandle);
      }
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      } else {
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      }
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
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
  selectServicesAsList,
  (apps, envs, ops, services) =>
    apps
      .map((app): DeployAppRow => {
        const env = findEnvById(envs, { id: app.environmentId });
        const appOps = findOperationsByAppId(ops, app.id);
        let lastOperation = schema.operations.empty;
        if (appOps.length > 0) {
          lastOperation = appOps[0];
        }
        const appServices = services.filter((s) => s.appId === app.id);
        const cost = appServices.reduce((acc, service) => {
          const mm = calcServiceMetrics(service);
          return acc + (mm.estimatedCostInDollars * 1024) / 1000;
        }, 0);
        const metrics = calcMetrics(services);

        return {
          ...app,
          ...metrics,
          envHandle: env.handle,
          lastOperation,
          cost,
          totalServices: appServices.length,
        };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle)),
);

const computeSearchMatch = (app: DeployAppRow, search: string): boolean => {
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

  const handleMatch = handle.includes(search);
  const envMatch = envHandle.includes(search);
  const userMatch = lastOpUser !== "" && lastOpUser.includes(search);
  const opMatch = lastOpType !== "" && lastOpType.includes(search);
  const opStatusMatch = lastOpStatus !== "" && lastOpStatus.includes(search);
  const idMatch = search === app.id;

  return (
    handleMatch || envMatch || opMatch || opStatusMatch || userMatch || idMatch
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
      } else {
        return b.cost - a.cost;
      }
    }

    if (sortBy === "handle") {
      if (sortDir === "asc") {
        return a.handle.localeCompare(b.handle);
      } else {
        return b.handle.localeCompare(a.handle);
      }
    }

    if (sortBy === "id") {
      if (sortDir === "asc") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      } else {
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      }
    }

    if (sortBy === "totalServices") {
      if (sortDir === "asc") {
        return a.totalServices - b.totalServices;
      } else {
        return b.totalServices - a.totalServices;
      }
    }

    if (sortBy === "envHandle") {
      if (sortDir === "asc") {
        return a.envHandle.localeCompare(b.envHandle);
      } else {
        return b.envHandle.localeCompare(a.envHandle);
      }
    }

    if (sortDir === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
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

const selectSearchProp = (_: WebState, props: { search: string }) =>
  props.search.toLocaleLowerCase();

const computeSearchMatchDb = (
  db: DeployDatabaseRow,
  search: string,
): boolean => {
  const handle = db.handle.toLocaleLowerCase();
  const envHandle = db.envHandle.toLocaleLowerCase();
  const dbType = db.type.toLocaleLowerCase();

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
  const idMatch = search === db.id;

  return (
    handleMatch ||
    dbTypeMatch ||
    envMatch ||
    opMatch ||
    opStatusMatch ||
    userMatch ||
    idMatch
  );
};

export const selectDatabasesForTableSearch = createSelector(
  selectDatabasesForTable,
  selectSearchProp,
  (dbs, search): DeployDatabaseRow[] => {
    if (search === "") {
      return dbs;
    }

    return dbs.filter((db) => computeSearchMatchDb(db, search));
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
