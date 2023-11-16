import { api, cacheMinTimer, cacheShortTimer } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createAction,
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AppState,
  DeployService,
  InstanceClass,
  LinkResponse,
} from "@app/types";

import { createSelector } from "@reduxjs/toolkit";
import { poll } from "saga-query";
import { computedCostsForContainer } from "../app/utils";
import { CONTAINER_PROFILES, GB } from "../container/utils";
import { DeployOperationResponse } from "../operation";
import { selectDeploy } from "../slice";

export const DEFAULT_INSTANCE_CLASS: InstanceClass = "m5";

export interface DeployServiceResponse {
  id: number;
  handle: string;
  created_at: string;
  updated_at: string;
  docker_repo: string;
  docker_ref: string;
  process_type: string;
  command: string;
  container_count: number;
  container_memory_limit_mb: number;
  instance_class: InstanceClass;
  _links: {
    current_release: LinkResponse;
    app?: LinkResponse;
    database?: LinkResponse;
    account: LinkResponse;
  };
  _type: "service";
}

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
    _links: {
      current_release: defaultHalHref(),
      app: defaultHalHref(),
      database: defaultHalHref(),
      account: defaultHalHref(),
      ...s._links,
    },
    _type: "service",
    ...s,
  };
};

export const deserializeDeployService = (
  payload: DeployServiceResponse,
): DeployService => {
  const links = payload._links;
  const appId = extractIdFromLink(links.app);
  const databaseId = extractIdFromLink(links.database);
  const environmentId = extractIdFromLink(links.account);

  return {
    id: `${payload.id}`,
    appId,
    databaseId,
    environmentId,
    handle: payload.handle,
    dockerRepo: payload.docker_repo,
    dockerRef: payload.docker_ref,
    processType: payload.process_type,
    command: payload.command || "",
    containerCount: payload.container_count,
    containerMemoryLimitMb: payload.container_memory_limit_mb,
    currentReleaseId: extractIdFromLink(links.current_release),
    instanceClass: payload.instance_class || DEFAULT_INSTANCE_CLASS,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const defaultDeployService = (
  s: Partial<DeployService> = {},
): DeployService => {
  const now = new Date().toISOString();
  return {
    id: "",
    appId: "",
    databaseId: "",
    environmentId: "",
    handle: "",
    dockerRef: "",
    dockerRepo: "",
    processType: "",
    command: "",
    containerCount: 0,
    containerMemoryLimitMb: 0,
    currentReleaseId: "",
    instanceClass: DEFAULT_INSTANCE_CLASS,
    createdAt: now,
    updatedAt: now,
    ...s,
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

export const DEPLOY_SERVICE_NAME = "services";
const slice = createTable<DeployService>({
  name: DEPLOY_SERVICE_NAME,
});
const { add: addDeployServices, reset: resetDeployServices } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_SERVICE_NAME],
);
const initService = defaultDeployService();
const must = mustSelectEntity(initService);
export const selectServiceById = must(selectors.selectById);
export const selectServicesByIds = selectors.selectByIds;
export const { selectTable: selectServices } = selectors;
export const hasDeployService = (a: DeployService) => a.id !== "";
export const serviceReducers = createReducerMap(slice);
export const findServiceById = must(selectors.findById);

export const selectServicesAsList = createSelector(
  selectors.selectTableAsList,
  (services) => services.sort((a, b) => a.handle.localeCompare(b.handle)),
);

export const selectServicesByAppId = createSelector(
  selectServicesAsList,
  (_: AppState, p: { appId: string }) => p.appId,
  (services, appId) => {
    return services.filter((service) => service.appId === appId);
  },
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

export const selectServicesByEnvId = createSelector(
  selectEnvToServicesMap,
  (_: AppState, p: { envId: string }) => p.envId,
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

export const fetchService = api.get<{ id: string }>("/services/:id");

export const fetchServices = api.get(
  "/services?per_page=5000",
  {
    saga: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    ctx.actions.push(resetDeployServices());
  },
);

export const fetchEnvironmentServices = api.get<{ id: string }>(
  "/accounts/:id/services",
);
export const fetchServicesByAppId = api.get<{ id: string }>(
  "/apps/:id/services",
  { saga: cacheShortTimer() },
);

export const fetchServiceSizingPoliciesByServiceId = api.get<{ id: string }>(
  "/services/:id/service_sizing_policies",
  { saga: cacheShortTimer() },
  api.cache(),
);

export const createServiceSizingPoliciesByServiceId = api.post<
  ServiceSizingPolicyEditProps,
  ServiceSizingPolicyResponse
>(["/services/:id/service_sizing_policies"], function* (ctx, next) {
  const {
    id,
    minimumMemory,
    maximumMemory,
    memoryScaleUp,
    memoryScaleDown,
    percentile,
    lookbackInterval,
    scaleUpCooldown,
    scaleDownCooldown,
    releaseCooldown,
    rRatioLimit,
    cRatioLimit,
  } = ctx.payload;
  const body = {
    id,
    minimum_memory: minimumMemory,
    maximum_memory: maximumMemory,
    mem_scale_up_threshold: memoryScaleUp,
    mem_scale_down_threshold: memoryScaleDown,
    percentile: percentile,
    metric_lookback_seconds: lookbackInterval,
    post_scale_up_cooldown_seconds: scaleUpCooldown,
    post_scale_down_cooldown_seconds: scaleDownCooldown,
    post_release_cooldown_seconds: releaseCooldown,
    mem_cpu_ratio_r_threshold: rRatioLimit,
    mem_cpu_ratio_c_threshold: cRatioLimit,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }
});

export const deleteServiceSizingPoliciesByServiceId = api.delete<{
  id: string;
}>("/services/:id/service_sizing_policy");

export interface ServiceSizingPolicyEditProps {
  id: string;
  minimumMemory?: number;
  maximumMemory?: number;
  memoryScaleUp?: number;
  memoryScaleDown?: number;
  percentile?: number;
  lookbackInterval?: number;
  scaleUpCooldown?: number;
  scaleDownCooldown?: number;
  releaseCooldown?: number;
  rRatioLimit?: number;
  cRatioLimit?: number;
}

export const updateServiceSizingPoliciesByServiceId = api.put<
  ServiceSizingPolicyEditProps,
  ServiceSizingPolicyResponse
>(["/services/:id/service_sizing_policies"], function* (ctx, next) {
  const {
    id,
    minimumMemory,
    maximumMemory,
    memoryScaleUp,
    memoryScaleDown,
    percentile,
    lookbackInterval,
    scaleUpCooldown,
    scaleDownCooldown,
    releaseCooldown,
    rRatioLimit,
    cRatioLimit,
  } = ctx.payload;
  const body = {
    id,
    minimum_memory: minimumMemory,
    maximum_memory: maximumMemory,
    mem_scale_up_threshold: memoryScaleUp,
    mem_scale_down_threshold: memoryScaleDown,
    percentile: percentile,
    metric_lookback_seconds: lookbackInterval,
    post_scale_up_cooldown_seconds: scaleUpCooldown,
    post_scale_down_cooldown_seconds: scaleDownCooldown,
    post_release_cooldown_seconds: releaseCooldown,
    mem_cpu_ratio_r_threshold: rRatioLimit,
    mem_cpu_ratio_c_threshold: cRatioLimit,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }
});

export interface ServiceSizingPolicyResponse {
  id: number;
  scaling_enabled: boolean;
  default_policy: boolean;
  metric_lookback_seconds: number;
  percentile: number;
  post_scale_up_cooldown_seconds: number;
  post_scale_down_cooldown_seconds: number;
  post_release_cooldown_seconds: number;
  mem_cpu_ratio_r_threshold: number;
  mem_cpu_ratio_c_threshold: number;
  mem_scale_up_threshold: number;
  mem_scale_down_threshold: number;
  minimum_memory: number;
  maximum_memory: number | undefined;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
  _type: "service_sizing_policy";
}

export const defaultServiceSizingPolicyResponse = (
  s: Partial<ServiceSizingPolicyResponse>,
): ServiceSizingPolicyResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    scaling_enabled: true,
    default_policy: false,
    metric_lookback_seconds: 300,
    percentile: 99,
    post_scale_up_cooldown_seconds: 60,
    post_scale_down_cooldown_seconds: 300,
    post_release_cooldown_seconds: 300,
    mem_cpu_ratio_r_threshold: 4,
    mem_cpu_ratio_c_threshold: 2,
    mem_scale_up_threshold: 0.9,
    mem_scale_down_threshold: 0.75,
    minimum_memory: 2048,
    maximum_memory: undefined,
    created_at: now,
    updated_at: now,
    _links: { account: { href: "" } },
    _type: "service_sizing_policy",
    ...s,
  };
};

export const fetchServiceOperations = api.get<{ id: string }>(
  "/services/:id/operations",
);
export const cancelServicesOpsPoll = createAction("cancel-services-ops-poll");
export const pollServiceOperations = api.get<{ id: string }>(
  ["/services/:id/operations", "poll"],
  { saga: poll(10 * 1000, `${cancelServicesOpsPoll}`) },
);

export const serviceEntities = {
  service: defaultEntity({
    id: "service",
    deserialize: deserializeDeployService,
    save: addDeployServices,
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

  const opId = ctx.json.data.id;
  ctx.loader = {
    message: `Scale service operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});
