import { api, cacheTimer } from '@app/api';
import { defaultEntity } from '@app/hal';
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from '@app/slice-helpers';
import { AppState, DeployLogDrain } from '@app/types';
import { selectDeploy } from '../slice';

export const deserializeLogDrain = (payload: any): DeployLogDrain => {
  return {
    id: payload.id,
    handle: payload.handle,
    drainType: payload.drain_type,
    drainHost: payload.drain_host,
    drainPort: payload.drain_port,
    drainUsername: payload.drain_username,
    drainPassword: payload.drain_password,
    url: payload.url,
    loggingToken: payload.logging_token,
    drainApps: payload.drain_apps,
    drainDatabases: payload.drain_databases,
    drainEphemeralSessions: payload.drain_ephemeral_sessions,
    drainProxies: payload.drain_proxies,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    status: payload.status,
  };
};

export const defaultDeployLogDrain = (
  ld: Partial<DeployLogDrain> = {},
): DeployLogDrain => {
  const now = new Date().toISOString();
  return {
    id: '',
    handle: '',
    drainType: '',
    drainHost: '',
    drainPort: '',
    drainUsername: '',
    drainPassword: '',
    url: '',
    loggingToken: '',
    drainApps: false,
    drainProxies: false,
    drainEphemeralSessions: false,
    drainDatabases: false,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    ...ld,
  };
};

export const DEPLOY_LOG_DRAIN_NAME = 'logDrains';
const slice = createTable<DeployLogDrain>({ name: DEPLOY_LOG_DRAIN_NAME });
const { add: addDeployLogDrains } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_LOG_DRAIN_NAME],
);
const initLogDrain = defaultDeployLogDrain();
const must = mustSelectEntity(initLogDrain);
export const selectLogDrainById = must(selectors.selectById);
export const { selectTableAsList: selectLogDrainsAsList } = selectors;
export const hasDeployLogDrain = (a: DeployLogDrain) => a.id != '';
export const logDrainReducers = createReducerMap(slice);

export const fetchLogDrains = api.get<{ environmentId: string }>(
  '/accounts/:id/log_drains',
  { saga: cacheTimer() },
);

export const logDrainEntities = {
  log_drain: defaultEntity({
    id: 'log_drain',
    deserialize: deserializeLogDrain,
    save: addDeployLogDrains,
  }),
};
