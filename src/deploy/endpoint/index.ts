import { createAction, createSelector } from "@reduxjs/toolkit";

import { api, cacheShortTimer, thunks } from "@app/api";
import {
  call,
  poll,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AcmeConfiguration,
  AcmeStatus,
  AppState,
  DeployEndpoint,
  DeployOperationResponse,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";

import { selectAppById, selectAppsByEnvId } from "../app";
import { createCertificate } from "../certificate";
import { selectDatabasesByEnvId } from "../database";
import { selectDeploy } from "../slice";

interface DeployEndpointResponse {
  id: number;
  acme: boolean;
  acme_configuration: AcmeConfiguration | null;
  acme_dns_challenge_host: string;
  acme_status: string;
  container_exposed_ports: string[] | null;
  container_port: string | null;
  container_ports: string[];
  default: boolean;
  docker_name: string | null;
  elastic_load_balancer_name: string | null;
  external_host: string;
  external_http_port: string | null;
  external_https_port: string | null;
  internal: boolean;
  internal_health_port: string | null;
  internal_host: string | null;
  internal_http_port: string | null;
  internal_https_port: string | null;
  ip_whitelist: string[];
  platform: "alb" | "elb";
  security_group_id: string;
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
    acme_configuration: null,
    acme_status: "",
    acme_dns_challenge_host: "",
    container_exposed_ports: [],
    container_port: "",
    container_ports: [],
    default: true,
    docker_name: "",
    elastic_load_balancer_name: "",
    external_host: "",
    external_http_port: "",
    external_https_port: "",
    internal: false,
    internal_health_port: "",
    internal_host: "",
    internal_http_port: "",
    internal_https_port: "",
    ip_whitelist: [],
    platform: "elb",
    type: "",
    user_domain: "",
    virtual_domain: "",
    security_group_id: "",
    status: "unknown",
    created_at: now,
    updated_at: now,
    _links: {
      service: defaultHalHref(),
      certificate: defaultHalHref(),
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
    acmeStatus: payload.acme_status as AcmeStatus,
    containerExposedPorts: payload.container_exposed_ports,
    containerPort: payload.container_port || "",
    containerPorts: payload.container_ports,
    createdAt: payload.created_at,
    default: payload.default,
    dockerName: payload.docker_name || "",
    externalHost: payload.external_host,
    externalHttpPort: payload.external_http_port || "",
    externalHttpsPort: payload.external_https_port || "",
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
    acmeConfiguration: null,
    acmeDnsChallengeHost: "",
    acmeStatus: "pending",
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
const {
  selectTable: selectEndpoints,
  selectTableAsList: selectEndpointsAsList,
} = selectors;
export const selectEndpointById = must(selectors.selectById);
export const findEndpointById = must(selectors.findById);
export { selectEndpoints, selectEndpointsAsList };
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

export const selectAppsByCertificateId = createSelector(
  selectAppsByEnvId,
  selectEndpointsByEnvironmentId,
  (_: AppState, p: { certificateId: string }) => p.certificateId,
  (apps, endpoints, certificateId) => {
    const endpointsWithCertificates = endpoints.filter(
      (endpoint) => endpoint.certificateId === certificateId,
    );

    return apps.filter((app) => {
      return app.serviceIds.some((appServiceId) => {
        return endpointsWithCertificates.find(
          (endpoint) => endpoint.serviceId === appServiceId,
        );
      });
    });
  },
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

export const cancelFetchEndpointPoll = createAction(
  "cancel-fetch-endpoint-poll",
);
export const pollFetchEndpoint = api.get<{ id: string }>(
  ["/vhosts/:id", "poll"],
  { saga: poll(5 * 1000, `${cancelFetchEndpointPoll}`) },
);

export const cancelEndpointOpsPoll = createAction("cancel-enp-ops-poll");
export const pollEndpointOperations = api.get<{ id: string }>(
  ["/vhosts/:id/operations", "poll"],
  { saga: poll(5 * 1000, `${cancelEndpointOpsPoll}`) },
  api.cache(),
);

export const endpointEntities = {
  vhost: defaultEntity({
    id: "vhost",
    deserialize: deserializeDeployEndpoint,
    save: addDeployEndpoints,
  }),
};

export type EndpointType = "default" | "managed" | "custom";

interface CreateEndpointBase {
  type: EndpointType;
  serviceId: string;
  internal: boolean;
  ipAllowlist: string[];
  containerPort?: string;
}

interface CreateDefaultEndpoint extends CreateEndpointBase {
  type: "default";
}

interface CreateManagedEndpoint extends CreateEndpointBase {
  type: "managed";
  domain: string;
  cert?: string;
  privKey?: string;
}

interface CreateCustomEndpoint extends CreateEndpointBase {
  type: "custom";
  cert: string;
  privKey: string;
}

export type CreateEndpointProps =
  | CreateDefaultEndpoint
  | CreateManagedEndpoint
  | CreateCustomEndpoint;

export const createEndpoint = api.post<
  CreateEndpointProps & { certId: string }
>("/services/:serviceId/vhosts", function* (ctx, next) {
  const data: Record<string, any> = {
    platform: "alb",
    type: "http_proxy_protocol",
    acme: ctx.payload.type === "managed",
    default: ctx.payload.type === "default",
    internal: ctx.payload.internal,
    ip_whitelist: ctx.payload.ipAllowlist,
    container_port: ctx.payload.containerPort,
    certificate_id: ctx.payload.certId,
  };

  if (ctx.payload.type === "managed") {
    data.user_domain = ctx.payload.domain;
  }

  const body = JSON.stringify(data);
  ctx.request = ctx.req({ body });

  yield* next();
});

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

export const deprovisionEndpoint = api.post<
  { id: string },
  DeployOperationResponse
>("/vhosts/:id/operations", function* (ctx, next) {
  const body = {
    type: "deprovision",
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { meta: { opId: ctx.json.data.id } };
});

export const provisionEndpoint = thunks.create<CreateEndpointProps>(
  "provision-endpoint",
  function* (ctx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    let certId = "";
    if (ctx.payload.type === "managed" || ctx.payload.type === "custom") {
      if (ctx.payload.cert && ctx.payload.privKey) {
        const certCtx = yield* call(
          createCertificate.run,
          createCertificate({
            cert: ctx.payload.cert,
            privKey: ctx.payload.privKey,
          }),
        );
        if (!certCtx.json.ok) {
          yield* put(
            setLoaderError({ id: ctx.key, message: certCtx.json.data.message }),
          );
          return;
        }

        certId = `${certCtx.json.data.id}`;
      }
    }

    const endpointCtx = yield* call(
      createEndpoint.run,
      createEndpoint({ ...ctx.payload, certId }),
    );

    if (!endpointCtx.json.ok) {
      yield* put(
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
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.json = {
      endpointCtx,
      opCtx,
    };
    yield* put(
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

export const renewEndpoint = api.post<{ id: string }, DeployOperationResponse>(
  ["/vhosts/:id/operations", "renew"],
  function* (ctx, next) {
    const body = {
      type: "renew",
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { meta: { opId: ctx.json.data.id } };
  },
);

export interface EndpointUpdateProps {
  id: string;
  ipAllowlist: string[];
  containerPort: string;
}

const patchEndpoint = api.patch<EndpointUpdateProps>(
  "/vhosts/:id",
  function* (ctx, next) {
    const body = JSON.stringify({
      ip_whitelist: ctx.payload.ipAllowlist,
      container_port: ctx.payload.containerPort,
    });
    ctx.request = ctx.req({ body });

    yield* next();
  },
);

export const updateEndpoint = thunks.create<EndpointUpdateProps>(
  "update-endpoint",
  function* (ctx, next) {
    yield* put(setLoaderStart({ id: ctx.key }));

    const patchCtx = yield* call(patchEndpoint.run, patchEndpoint(ctx.payload));
    if (!patchCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: patchCtx.json.data.message }),
      );
      return;
    }

    const opCtx = yield* call(
      createEndpointOperation.run,
      createEndpointOperation({
        endpointId: ctx.payload.id,
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.loader = { id: ctx.key, meta: { opId: opCtx.json.data.id } };
    yield* next();
  },
);

export function requiresAcmeSetup(enp: DeployEndpoint) {
  return enp.acme && enp.acmeStatus !== "ready" && enp.status === "provisioned";
}

function ensureTrailingPeriod(name: string) {
  if (name[name.length - 1] === ".") {
    return name;
  }
  return `${name}.`;
}

interface DnsAnswer {
  data: string;
}

export const checkDns = thunks.create<{ from: string; to: string }>(
  "check-dns",
  function* (ctx, next) {
    const { from, to } = ctx.payload;
    yield* put(setLoaderStart({ id: ctx.key }));
    // we add a random number to the google request so the browser
    // doesn't cache the response
    const rand = Math.floor(Math.random() * 10000);
    const resp = yield* call(
      fetch,
      `https://dns.google.com/resolve?rand=${rand}&name=${ensureTrailingPeriod(
        from,
      )}`,
    );
    const data: { Status: number; Answer: DnsAnswer[] } = yield* call([
      resp,
      "json",
    ]);

    let success = false;
    const answers: DnsAnswer[] = data.Answer || [];

    if (data.Status !== 0) {
      yield* put(setLoaderSuccess({ id: ctx.key, meta: { success } }));
    }

    success = answers.some((answer) => {
      return ensureTrailingPeriod(answer.data) === ensureTrailingPeriod(to);
    });

    yield* put(setLoaderSuccess({ id: ctx.key, meta: { success } }));
    yield* next();
  },
);

export const getPlacement = (enp: DeployEndpoint) => {
  if (enp.externalHost) {
    return "External (publicly accessible)";
  }

  return "Internal";
};

export const getIpAllowlistText = (enp: DeployEndpoint) => {
  return enp.ipWhitelist.length > 0 ? enp.ipWhitelist.join(", ") : "Disabled";
};

export const getContainerPort = (
  enp: DeployEndpoint,
  exposedPorts: number[],
) => {
  let port = "Unknown";
  if (exposedPorts.length > 0) {
    const ports = exposedPorts.sort();
    port = `${ports[0]}`;
  }
  return enp.containerPort || `Default (${port})`;
};

export const getEndpointUrl = (enp: DeployEndpoint) => {
  if (!hasDeployEndpoint(enp)) {
    return enp.id;
  }

  if (enp.status === "provisioning") {
    return "Provisioning";
  }

  if (enp.type === "tcp") {
    return enp.externalHost;
  }

  return `https://${enp.virtualDomain}`;
};

export const getEndpointText = (
  enp: DeployEndpoint,
  exposedPorts: number[],
) => {
  return {
    url: getEndpointUrl(enp),
    placement: getPlacement(enp),
    ipAllowlist: getIpAllowlistText(enp),
    containerPort: getContainerPort(enp, exposedPorts),
  };
};

export const parseIpStr = (ips: string) => {
  return ips.split(/\s+/).filter(Boolean);
};
