import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createAction,
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AppState,
  DeployOperationResponse,
  DeployService,
  InstanceClass,
  LinkResponse,
} from "@app/types";

import { computedCostsForContainer } from "../app/utils";
import { CONTAINER_PROFILES, GB } from "../container/utils";
import { selectDeploy } from "../slice";
import { poll } from "saga-query";

export const DEFAULT_INSTANCE_CLASS: InstanceClass = "m4";

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
    instance_class: "m4",
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
const { add: addDeployServices } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_SERVICE_NAME],
);
const initService = defaultDeployService();
const must = mustSelectEntity(initService);
export const selectServiceById = must(selectors.selectById);
export const selectServicesByIds = selectors.selectByIds;
export const {
  selectTableAsList: selectServicesAsList,
  selectTable: selectServices,
} = selectors;
export const hasDeployService = (a: DeployService) => a.id !== "";
export const serviceReducers = createReducerMap(slice);
export const findServiceById = must(selectors.findById);

export const fetchService = api.get<{ id: string }>("/services/:id");
export const fetchEnvironmentServices = api.get<{ id: string }>(
  "/accounts/:id/services",
);
export const fetchAppServices = api.get<{ id: string }>("/apps/:id/services");

export const fetchServiceOperations = api.get<{ id: string }>(
  "/services/:id/operations",
  api.cache(),
);
export const cancelServicesOpsPoll = createAction("cancel-services-ops-poll");
export const pollServiceOperations = api.get<{ id: string }>(
  ["/services/:id/operations", "poll"],
  { saga: poll(5 * 1000, `${cancelServicesOpsPoll}`) },
  api.cache(),
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
