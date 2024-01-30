import { api, cacheMinTimer, cacheShortTimer, thunks } from "@app/api";
import { createAction, createSelector, parallel, poll, select } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, defaultDeployOperation, schema } from "@app/schema";
import {
  DeployOperation,
  type DeployService,
  DeployServiceResponse,
  DeployServiceRow,
  type InstanceClass,
  excludesFalse,
} from "@app/types";
import {
  cancelAppOpsPoll,
  fetchAppOperations,
  findAppById,
  selectApps,
} from "../app";
import { computedCostsForContainer } from "../app/utils";
import { CONTAINER_PROFILES, GB } from "../container/utils";
import {
  cancelDatabaseOpsPoll,
  fetchDatabaseOperations,
  selectDatabaseById,
} from "../database";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironmentsByOrg,
  selectEnvironmentsByOrgAsList,
} from "../environment";
import {
  DeployOperationResponse,
  findOperationValue,
  selectNonFailedScaleOps,
} from "../operation";

export const DEFAULT_INSTANCE_CLASS: InstanceClass = "m5";

export const defaultServiceResponse = (
  s: Partial<DeployServiceResponse> = {},
): DeployServiceResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    handle: "",
    docker_repo: "",
    docker_ref: "",
    process_type: "",
    command: "",
    container_count: 0,
    container_memory_limit_mb: 0,
    instance_class: DEFAULT_INSTANCE_CLASS,
    created_at: now,
    updated_at: now,
    _type: "service",
    ...s,
    _links: {
      current_release: defaultHalHref(),
      app: defaultHalHref(),
      database: defaultHalHref(),
      account: defaultHalHref(),
      service_sizing_policy: defaultHalHref(),
      ...s._links,
    },
  };
};

export const deserializeDeployService = (
  payload: DeployServiceResponse,
): DeployService => {
  const links = payload._links;
  const appId = extractIdFromLink(links.app);
  const databaseId = extractIdFromLink(links.database);
  const environmentId = extractIdFromLink(links.account);
  const serviceSizingPolicyId = extractIdFromLink(links.service_sizing_policy);

  return {
    id: `${payload.id}`,
    appId,
    databaseId,
    environmentId,
    serviceSizingPolicyId,
    handle: payload.handle,
    dockerRepo: payload.docker_repo,
    dockerRef: payload.docker_ref,
    processType: payload.process_type,
    command: payload.command || "",
    containerCount: payload.container_count ?? 0,
    containerMemoryLimitMb: payload.container_memory_limit_mb || 512,
    currentReleaseId: extractIdFromLink(links.current_release),
    instanceClass: payload.instance_class || DEFAULT_INSTANCE_CLASS,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const serviceCommandText = (service: DeployService) => {
  return service.processType === "cmd" ? "Docker CMD" : service.command;
};

export const calcServiceMetrics = (service: DeployService) => {
  const containerProfile =
    CONTAINER_PROFILES[service.instanceClass || DEFAULT_INSTANCE_CLASS];

  if (!containerProfile) {
    throw new Error(
      `could not find container profile for ${service.instanceClass}`,
    );
  }

  const containerSizeGB = service.containerMemoryLimitMb / GB;
  const cpuShare = service.containerMemoryLimitMb / containerProfile.cpuShare;
  const { estimatedCostInCents, estimatedCostInDollars } =
    computedCostsForContainer(
      service.containerCount,
      containerProfile,
      containerSizeGB,
    );

  return {
    containerProfile,
    containerSizeGB,
    cpuShare,
    estimatedCostInCents,
    estimatedCostInDollars,
  };
};

export const selectServiceById = schema.services.selectById;
export const selectServicesByIds = schema.services.selectByIds;
export const selectServices = schema.services.selectTable;
export const hasDeployService = (a: DeployService) => a.id !== "";
export const findServiceById = schema.services.findById;

export const selectServicesAsList = createSelector(
  schema.services.selectTableAsList,
  (services) => [...services].sort((a, b) => a.handle.localeCompare(b.handle)),
);

export const selectEnvToServicesMap = createSelector(
  selectServicesAsList,
  (services) => {
    const envToServiceMap: Record<string, Set<string> | undefined> = {};
    services.forEach((service) => {
      if (!(service.appId || service.databaseId)) {
        return;
      }

      if (!Object.hasOwn(envToServiceMap, service.environmentId)) {
        envToServiceMap[service.environmentId] = new Set<string>();
      }
      envToServiceMap[service.environmentId]?.add(service.id);
    });
    return envToServiceMap;
  },
);

export const selectServicesByOrgId = createSelector(
  selectEnvToServicesMap,
  selectEnvironmentsByOrgAsList,
  selectServices,
  (envToServicesMap, envs, servicesMap) => {
    const servicesOrg = new Set<DeployService>();
    envs.forEach((env) => {
      const servs = envToServicesMap[env.id];
      if (!servs) return;
      [...servs]
        .map((id) => servicesMap[id])
        .filter(excludesFalse)
        .forEach((service) => {
          servicesOrg.add(service);
        });
    });
    return [...servicesOrg];
  },
);

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

export const selectServicesByAppId = createSelector(
  selectServicesForTable,
  (_: WebState, p: { appId: string }) => p.appId,
  (services, appId) => {
    return services.filter((service) => service.appId === appId);
  },
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

export const selectServicesByEnvId = createSelector(
  selectEnvToServicesMap,
  (_: WebState, p: { envId: string }) => p.envId,
  (envToServicesMap, envId) => {
    return envToServicesMap[envId] || new Set<string>();
  },
);

export const selectAppToServicesMap = createSelector(
  selectServicesAsList,
  (services) => {
    const appToServiceMap: Record<string, string[] | undefined> = {};

    services.forEach((service) => {
      if (!service.appId) {
        return;
      }

      if (!Object.hasOwn(appToServiceMap, service.appId)) {
        appToServiceMap[service.appId] = [];
      }

      appToServiceMap[service.appId]?.push(service.id);
    });

    return appToServiceMap;
  },
);

export const selectAppByServiceId = createSelector(
  selectServiceById,
  selectApps,
  (service, apps) => {
    return findAppById(apps, { id: service.appId });
  },
);

const scaleAttrs: (keyof DeployOperation)[] = [
  "containerCount",
  "containerSize",
  "instanceProfile",
];

export const selectPreviousServiceScale = createSelector(
  selectServiceById,
  selectNonFailedScaleOps,
  (service, ops) => {
    // If the values aren't found among the operations use the following default values
    const pastOps = ops.slice(1).concat(
      defaultDeployOperation({
        containerCount: 1,
        containerSize: 1024,
        instanceProfile: service.instanceClass,
      }),
    );

    const prev: DeployOperation = { ...pastOps[0] };

    scaleAttrs.forEach((attr) => {
      (prev as any)[attr] = findOperationValue(pastOps, attr);
    });

    return prev;
  },
);

export const selectServiceScale = createSelector(
  selectNonFailedScaleOps,
  selectPreviousServiceScale,
  (ops, prevOp) => {
    const lastOps = ops.slice(0, 1).concat(prevOp);
    const current: DeployOperation = { ...lastOps[0] };

    scaleAttrs.forEach((attr) => {
      (current as any)[attr] = findOperationValue(lastOps, attr);
    });

    return current;
  },
);

export const fetchService = api.get<{ id: string }>("/services/:id");

export const fetchServices = api.get(
  "/services?per_page=5000",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.services.reset());
  },
);

export const fetchEnvironmentServices = api.get<{ id: string }>(
  "/accounts/:id/services",
);
export const fetchServicesByAppId = api.get<{ id: string }>(
  "/apps/:id/services",
  { supervisor: cacheShortTimer() },
);

export const fetchServiceOperations = api.get<{ id: string }>(
  "/services/:id/operations",
);
export const cancelServicesOpsPoll = createAction("cancel-services-ops-poll");
export const pollServiceOperations = api.get<{ id: string }>(
  ["/services/:id/operations", "poll"],
  { supervisor: poll(10 * 1000, `${cancelServicesOpsPoll}`) },
);

export const serviceEntities = {
  service: defaultEntity({
    id: "service",
    deserialize: deserializeDeployService,
    save: schema.services.add,
  }),
};

export interface ServiceScaleProps {
  id: string;
  containerCount?: number;
  containerSize?: number;
  containerProfile?: InstanceClass;
}

export const scaleService = api.post<
  ServiceScaleProps,
  DeployOperationResponse
>(["/services/:id/operations", "scale"], function* (ctx, next) {
  const { id, containerCount, containerProfile, containerSize } = ctx.payload;
  const body = {
    type: "scale",
    id,
    container_count: containerCount,
    instance_profile: containerProfile,
    container_size: containerSize,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Scale service operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const pollAppAndServiceOperations = thunks.create<{ id: string }>(
  "app-service-op-poll",
  { supervisor: poll(10 * 1000, `${cancelAppOpsPoll}`) },
  function* (ctx, next) {
    yield* schema.update(schema.loaders.start({ id: ctx.key }));

    const services = yield* select((s: WebState) =>
      selectServicesByAppId(s, {
        appId: ctx.payload.id,
      }),
    );
    const serviceOps = services.map(
      (service) => () =>
        fetchServiceOperations.run(fetchServiceOperations({ id: service.id })),
    );
    const group = yield* parallel([
      () => fetchAppOperations.run(fetchAppOperations(ctx.payload)),
      ...serviceOps,
    ]);
    yield* group;

    yield* next();
    yield* schema.update(schema.loaders.success({ id: ctx.key }));
  },
);

export const pollDatabaseAndServiceOperations = thunks.create<{ id: string }>(
  "db-service-op-poll",
  { supervisor: poll(10 * 1000, `${cancelDatabaseOpsPoll}`) },
  function* (ctx, next) {
    yield* schema.update(schema.loaders.start({ id: ctx.key }));
    const dbb = yield* select((s: WebState) =>
      selectDatabaseById(s, ctx.payload),
    );

    const group = yield* parallel([
      () => fetchDatabaseOperations.run(fetchDatabaseOperations(ctx.payload)),
      () =>
        fetchServiceOperations.run(
          fetchServiceOperations({ id: dbb.serviceId }),
        ),
    ]);
    yield* group;

    yield* next();
    yield* schema.update(schema.loaders.success({ id: ctx.key }));
  },
);
