import { api, cacheTimer } from '@app/api';
import { defaultEntity, extractIdFromLink } from '@app/hal';
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from '@app/slice-helpers';
import type { AppState, DeployEndpoint } from '@app/types';
import { createSelector } from '@reduxjs/toolkit';
import { selectDeploy } from '../slice';

export const deserializeDeployEndpoint = (payload: any): DeployEndpoint => {
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
  };
};

export const defaultDeployEndpoint = (
  e: Partial<DeployEndpoint> = {},
): DeployEndpoint => {
  const now = new Date().toISOString();
  return {
    id: '',
    status: 'pending',
    acme: false,
    acmeConfiguration: {},
    acmeDnsChallengeHost: '',
    acmeStatus: '',
    containerExposedPorts: [],
    containerPort: '',
    containerPorts: [],
    default: false,
    dockerName: '',
    externalHost: '',
    externalHttpPort: '',
    externalHttpsPort: '',
    internal: false,
    ipWhitelist: [],
    platform: 'elb',
    type: '',
    createdAt: now,
    updatedAt: now,
    userDomain: '',
    virtualDomain: '',
    serviceId: '',
    ...e,
  };
};

export const DEPLOY_ENDPOINT_NAME = 'endpoints';
const slice = createTable<DeployEndpoint>({
  name: DEPLOY_ENDPOINT_NAME,
});
const { add: addDeployEndpoints } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ENDPOINT_NAME],
);
const initApp = defaultDeployEndpoint();
const must = mustSelectEntity(initApp);
export const selectEndpointById = must(selectors.selectById);
export const { selectTableAsList: selectEndpointsAsList } = selectors;
export const hasDeployEndpoint = (a: DeployEndpoint) => a.id != '';
export const endpointReducers = createReducerMap(slice);
export const selectEndpointsByServiceIds = createSelector(
  selectEndpointsAsList,
  (_: AppState, p: { ids: string[] }) => p.ids,
  (endpoints, serviceIds) => {
    return endpoints.filter((end) => serviceIds.includes(end.serviceId));
  },
);

export const fetchEndpointsByAppId = api.get<{ id: string }>(
  '/apps/:id/vhosts',
  { saga: cacheTimer() },
);
export const fetchEndpointsByServiceId = api.get<{ id: string }>(
  '/services/:id/vhosts',
  {
    saga: cacheTimer(),
  },
);
export const fetchEndpoint = api.get<{ id: string }>('/vhosts/:id', {
  saga: cacheTimer(),
});

export const endpointEntities = {
  vhost: defaultEntity({
    id: 'vhost',
    deserialize: deserializeDeployEndpoint,
    save: addDeployEndpoints,
  }),
};
