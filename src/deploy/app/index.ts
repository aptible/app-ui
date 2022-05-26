import { api, cacheTimer } from '@app/api';
import { defaultEntity, extractIdFromLink } from '@app/hal';
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from '@app/slice-helpers';
import type { DeployApp, AppState, DeployService } from '@app/types';

import { deserializeImage } from '../image';
import { deserializeOperation } from '../operation';
import { deserializeDeployService } from '../service';
import { selectDeploy } from '../slice';

export * from './utils';

export const deserializeDeployApp = (payload: any): DeployApp => {
  const services: DeployService[] = payload._embedded.services.map(
    deserializeDeployService,
  );
  const links = payload._links;
  const embedded = payload._embedded;

  return {
    id: `${payload.id}`,
    handle: payload.handle,
    gitRepo: payload.git_repo,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    deploymentMethod: payload.deployment_method,
    status: payload.status,
    environmentId: extractIdFromLink(links.account),
    currentConfigurationId: extractIdFromLink(links.current_configuration),
    currentImage: deserializeImage(embedded.current_image),
    lastDeployOperation: deserializeOperation(embedded.last_deploy_operation),
    lastOperation: deserializeOperation(embedded.last_operation),
    services,
  };
};

export const defaultDeployApp = (a: Partial<DeployApp> = {}): DeployApp => {
  const now = new Date().toISOString();
  return {
    id: '',
    handle: '',
    gitRepo: '',
    createdAt: now,
    updatedAt: now,
    deploymentMethod: '',
    status: 'pending',
    environmentId: '',
    currentConfigurationId: '',
    currentImage: null,
    lastDeployOperation: null,
    lastOperation: null,
    services: [],
    ...a,
  };
};

export const DEPLOY_APP_NAME = 'apps';
const slice = createTable<DeployApp>({ name: DEPLOY_APP_NAME });
const { add: addDeployApps } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_APP_NAME],
);
const initApp = defaultDeployApp();
const must = mustSelectEntity(initApp);
export const selectAppById = must(selectors.selectById);
export const { selectTableAsList: selectAppsAsList } = selectors;
export const hasDeployApp = (a: DeployApp) => a.id != '';
export const appReducers = createReducerMap(slice);

export const fetchApps = api.get('/apps', { saga: cacheTimer() });
export const fetchApp = api.get<{ id: string }>('/apps/:id', {
  saga: cacheTimer(),
});

export const appEntities = {
  app: defaultEntity({
    id: 'app',
    deserialize: deserializeDeployApp,
    save: addDeployApps,
  }),
};
