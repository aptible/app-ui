import { api, cacheMinTimer, cacheShortTimer, thunks } from "@app/api";
import { createAction, createSelector, parallel, poll, select } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, defaultDeployOperation, schema } from "@app/schema";
import {
  ContainerProfileData,
  DeployOperation,
  type DeployService,
  DeployServiceResponse,
  type InstanceClass,
  excludesFalse,
} from "@app/types";
import { computedCostsForContainer } from "../app/utils";
import { CONTAINER_PROFILES, GB } from "../container/utils";
import {
  cancelDatabaseOpsPoll,
  fetchDatabaseOperations,
  selectDatabaseById,
} from "../database";
import { selectEnvironmentsByOrgAsList } from "../environment";
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

export const getContainerProfileFromType = (
  containerProfile: InstanceClass,
): ContainerProfileData => {
  if (!CONTAINER_PROFILES[containerProfile]) {
    return {
      name: "",
      costPerContainerHourInCents: 0,
      cpuShare: 0,
      minimumContainerSize: 0,
      maximumContainerSize: 0,
      maximumContainerCount: 0,
    };
  }
  return CONTAINER_PROFILES[containerProfile];
};

export const calcMetrics = (services: DeployService[]) => {
  const totalMemoryLimit = () => {
    let total = 0;
    services.forEach((s) => {
      if (s.containerCount === 0) return;
      total += s.containerMemoryLimitMb;
    });
    return total;
  };

  const totalCPU = () => {
    let total = 0;
    services.forEach((s) => {
      if (s.containerCount === 0) return;
      total +=
        s.containerMemoryLimitMb *
        getContainerProfileFromType(s.instanceClass).cpuShare;
    });
    return total;
  };

  return {
    totalCPU: totalCPU(),
    totalMemoryLimit: totalMemoryLimit(),
  };
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
export const findServicesByIds = schema.services.findByIds;

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

export const selectServicesByAppId = createSelector(
  selectServicesAsList,
  (_: WebState, p: { appId: string }) => p.appId,
  (services, appId) => services.filter((s) => s.appId === appId),
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
