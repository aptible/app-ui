import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { api, cacheShortTimer, thunks } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AppState,
  DeployEndpoint,
  DeployOperationResponse,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

import { selectAppById, selectAppsByEnvId } from "../app";
import { selectDatabasesByEnvId } from "../database";
import { selectDeploy } from "../slice";

interface DeployEndpointResponse {
  id: number;
  acme: boolean;
  acme_configuration: string;
  acme_dns_challenge_host: string;
  acme_status: string;
  container_exposed_ports: string[];
  container_port: string;
  container_ports: string[];
  default: boolean;
  docker_name: string;
  external_host: string;
  external_http_port: string;
  external_https_port: string;
  internal: boolean;
  ip_whitelist: string[];
  platform: "alb" | "elb";
  type: string;
  user_domain: string;
  virtual_domain: string;
  status: ProvisionableStatus;
  created_at: string;
  updated_at: string;
  _links: {
    service: LinkResponse;
    certificate: LinkResponse;
  };
  _type: "vhost";
}

export const defaultEndpointResponse = (
  resp: Partial<DeployEndpointResponse> = {},
): DeployEndpointResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    acme: false,
    acme_configuration: "",
    acme_status: "",
    acme_dns_challenge_host: "",
    container_exposed_ports: [],
    container_port: "",
    container_ports: [],
    default: true,
    docker_name: "",
    external_host: "",
    external_http_port: "",
    external_https_port: "",
    internal: false,
    ip_whitelist: [],
    platform: "elb",
    type: "",
    user_domain: "",
    virtual_domain: "",
    status: "unknown",
    created_at: now,
    updated_at: now,
    _links: {
      service: { href: "" },
      certificate: { href: "" },
    },
    _type: "vhost",
    ...resp,
  };
};

export const deserializeDeployEndpoint = (
  payload: DeployEndpointResponse,
): DeployEndpoint => {
  return {
    id: `${payload.id}`,
    acme: payload.acme,
    acmeConfiguration: payload.acme_configuration,
    acmeDnsChallengeHost: payload.acme_dns_challenge_host,
    acmeStatus: payload.acme_status,
    containerExposedPorts: payload.container_exposed_ports,
    containerPort: payload.container_port,
    containerPorts: payload.container_ports,
    createdAt: payload.created_at,
    default: payload.default,
    dockerName: payload.docker_name,
    externalHost: payload.external_host,
    externalHttpPort: payload.external_http_port,
    externalHttpsPort: payload.external_https_port,
    internal: payload.internal,
    ipWhitelist: payload.ip_whitelist,
    platform: payload.platform,
    type: payload.type,
    updatedAt: payload.updated_at,
    userDomain: payload.user_domain,
    virtualDomain: payload.virtual_domain,
    status: payload.status,
    serviceId: extractIdFromLink(payload._links.service),
    certificateId: extractIdFromLink(payload._links.certificate),
  };
};

export const defaultDeployEndpoint = (
  e: Partial<DeployEndpoint> = {},
): DeployEndpoint => {
  const now = new Date().toISOString();
  return {
    id: "",
    status: "pending",
    acme: false,
    acmeConfiguration: {},
    acmeDnsChallengeHost: "",
    acmeStatus: "",
    containerExposedPorts: [],
    containerPort: "",
    containerPorts: [],
    default: false,
    dockerName: "",
    externalHost: "",
    externalHttpPort: "",
    externalHttpsPort: "",
    internal: false,
    ipWhitelist: [],
    platform: "elb",
    type: "",
    createdAt: now,
    updatedAt: now,
    userDomain: "",
    virtualDomain: "",
    serviceId: "",
    certificateId: "",
    ...e,
  };
};

export const DEPLOY_ENDPOINT_NAME = "endpoints";
const slice = createTable<DeployEndpoint>({
  name: DEPLOY_ENDPOINT_NAME,
});
const { add: addDeployEndpoints, remove: removeDeployEndpoints } =
  slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ENDPOINT_NAME],
);
const initApp = defaultDeployEndpoint();
const must = mustSelectEntity(initApp);
export const selectEndpointById = must(selectors.selectById);
export const { selectTableAsList: selectEndpointsAsList } = selectors;
export const hasDeployEndpoint = (a: DeployEndpoint) => a.id !== "";
export const endpointReducers = createReducerMap(slice);

export const selectEndpointsByServiceIds = createSelector(
  selectEndpointsAsList,
  (_: AppState, p: { ids: string[] }) => p.ids,
  (endpoints, serviceIds) => {
    return endpoints.filter((end) => serviceIds.includes(end.serviceId));
  },
);

export const selectEndpointsByAppId = createSelector(
  selectEndpointsAsList,
  selectAppById,
  (endpoints, app) => {
    return endpoints.filter((end) => app.serviceIds.includes(end.serviceId));
  },
);

export const selectFirstEndpointByAppId = createSelector(
  selectEndpointsByAppId,
  (endpoints) => {
    if (endpoints.length === 0) {
      return defaultDeployEndpoint();
    }

    return endpoints[0];
  },
);

export const selectEndpointsByEnvironmentId = createSelector(
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEndpointsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (apps, databases, endpoints, envId) => {
    const serviceIdsUsedInAppsAndDatabases: string[] = [
      // one app can have multiple services, so pull those out
      ...apps
        .filter((app) => app.environmentId === envId)
        .map((app) => app.serviceIds),
      databases
        .filter((database) => database.environmentId === envId)
        .map((db) => db.serviceId),
    ].reduce((acc, elem) => acc.concat(...elem));
    return endpoints.filter((endpoint) =>
      serviceIdsUsedInAppsAndDatabases.includes(endpoint.serviceId),
    );
  },
);

export const selectEndpointByEnvironmentAndCertificateId = createSelector(
  selectEndpointsByEnvironmentId,
  (_: AppState, p: { certificateId: string }) => p.certificateId,
  (endpoints, certificateId) =>
    endpoints.filter((endpoint) => endpoint.certificateId === certificateId),
);

export const fetchEndpointsByAppId = api.get<{ appId: string }>(
  "/apps/:appId/vhosts",
  { saga: cacheShortTimer() },
);
export const fetchEndpointsByEnvironmentId = api.get<{ id: string }>(
  "/accounts/:id/vhosts",
  { saga: cacheShortTimer() },
);
export const fetchEndpointsByServiceId = api.get<{ id: string }>(
  "/services/:id/vhosts",
  {
    saga: cacheShortTimer(),
  },
);

export const fetchEndpoint = api.get<{ id: string }>("/vhosts/:id", {
  saga: cacheShortTimer(),
});

export const endpointEntities = {
  vhost: defaultEntity({
    id: "vhost",
    deserialize: deserializeDeployEndpoint,
    save: addDeployEndpoints,
  }),
};

export interface CreateEndpointProps {
  serviceId: string;
}

export const createEndpoint = api.post<CreateEndpointProps>(
  "/services/:serviceId/vhosts",
  function* (ctx, next) {
    const body = JSON.stringify({
      platform: "alb",
      type: "http_proxy_protocol",
      default: true,
      acme: false,
      internal: false,
    });
    ctx.request = ctx.req({ body });

    yield* next();
  },
);

export const deleteEndpoint = api.delete<{ id: string }>(
  "/vhosts/:id",
  function* (ctx, next) {
    yield* next();
    ctx.actions.push(removeDeployEndpoints([ctx.payload.id]));
  },
);

interface CreateEndpointOpProps {
  endpointId: string;
  type: string;
}

export const createEndpointOperation = api.post<
  CreateEndpointOpProps,
  DeployOperationResponse
>("/vhosts/:endpointId/operations", function* (ctx, next) {
  const { type } = ctx.payload;
  const body = {
    type,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
});

export const provisionEndpoint = thunks.create<CreateEndpointProps>(
  "provision-endpoint",
  function* (ctx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    const endpointCtx = yield* call(
      createEndpoint.run,
      createEndpoint(ctx.payload),
    );

    if (!endpointCtx.json.ok) {
      yield put(
        setLoaderError({ id: ctx.key, message: endpointCtx.json.data.message }),
      );
      return;
    }

    yield* next();

    const opCtx = yield* call(
      createEndpointOperation.run,
      createEndpointOperation({
        endpointId: `${endpointCtx.json.data.id}`,
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.json = {
      endpointCtx,
      opCtx,
    };
    yield put(
      setLoaderSuccess({
        id: ctx.key,
        meta: {
          endpointId: endpointCtx.json.data.id,
          opId: opCtx.json.data.id,
        },
      }),
    );
  },
);
