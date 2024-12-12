import { api, cacheMinTimer, cacheShortTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { DEFAULT_INSTANCE_CLASS, type WebState, schema } from "@app/schema";
import {
  type ContainerProfileData,
  type DeployOperation,
  type DeployService,
  type DeployServiceResponse,
  type InstanceClass,
  excludesFalse,
} from "@app/types";
import { CONTAINER_PROFILES, GB } from "../container/utils";
import { selectEnvironmentsByOrgAsList } from "../environment";

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
    force_zero_downtime: false,
    naive_health_check: false,
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
    forceZeroDowntime: payload.force_zero_downtime,
    naiveHealthCheck: payload.naive_health_check,
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

  return {
    containerProfile,
    containerSizeGB,
    cpuShare,
  };
};

export interface ServiceEditProps {
  forceZeroDowntime: boolean;
  naiveHealthCheck: boolean;
}

const serializeServiceEditProps = (payload: ServiceEditProps) => ({
  force_zero_downtime: payload.forceZeroDowntime,
  naive_health_check: payload.naiveHealthCheck,
});

export interface ModifyServiceProps extends ServiceEditProps {
  id: string;
}

export const updateServiceById = api.put<
  ModifyServiceProps,
  DeployServiceResponse
>("/services/:id", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify(serializeServiceEditProps(ctx.payload)),
  });
  yield* next();
});

export const selectServiceById = schema.services.selectById;
export const selectServicesByIds = schema.services.selectByIds;
export const selectServices = schema.services.selectTable;
export const hasDeployService = (a: DeployService) => a.id !== "";
export const findServiceById = schema.services.findById;
export const findServicesByIds = schema.services.findByIds;
export const findServicesByAppId = (services: DeployService[], appId: string) =>
  services.filter((s) => s.appId === appId);
export const findServicesByDatabaseId = (
  services: DeployService[],
  databaseId: string,
) => services.filter((s) => s.databaseId === databaseId);
export const findServicesByEnvId = (services: DeployService[], envId: string) =>
  services.filter((s) => s.environmentId === envId);

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
  selectServicesAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  findServicesByEnvId,
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
  recId?: string;
}

export const selectServicesByAppId = createSelector(
  selectServicesAsList,
  (_: WebState, p: { appId: string }) => p.appId,
  (services, appId) => services.filter((s) => s.appId === appId),
);

export const getScaleTextFromOp = (op: DeployOperation): string => {
  const str: string[] = [];

  if (op.containerCount !== -1) {
    str.push(
      `${op.containerCount} container${op.containerCount > 1 ? "s" : ""}`,
    );
  }

  if (op.containerSize !== -1) {
    str.push(`${op.containerSize / 1024} GB RAM`);
  }

  if (op.diskSize !== 0) {
    str.push(`${op.diskSize} GB Disk`);
  }

  if (op.instanceProfile !== "") {
    const profile =
      getContainerProfileFromType(op.instanceProfile as InstanceClass).name ||
      op.instanceProfile;
    str.push(profile);
  }

  return str.join(" • ");
};
