import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployAppConfig, LinkResponse } from "@app/types";

export interface DeployConfigurationResponse {
  id: number;
  env: { [key: string]: string | number | boolean };
  _links: {
    resource: LinkResponse;
  };
  _type: "configuration";
}

export const defaultConfigurationResponse = (
  c: Partial<DeployConfigurationResponse> = {},
): DeployConfigurationResponse => {
  return {
    id: 0,
    env: {},
    _links: {
      resource: defaultHalHref(),
    },
    _type: "configuration",
    ...c,
  };
};

export const deserializeAppConfig = (
  resp: DeployConfigurationResponse,
): DeployAppConfig => {
  return {
    id: `${resp.id}`,
    env: resp.env,
    appId: extractIdFromLink(resp._links.resource),
  };
};

export const defaultDeployAppConfig = (
  a: Partial<DeployAppConfig> = {},
): DeployAppConfig => {
  return {
    id: "",
    env: {},
    appId: "",
    ...a,
  };
};

export const APP_CONFIG_NAME = "appConfigs";
const slice = createTable<DeployAppConfig>({ name: APP_CONFIG_NAME });
export const { add: addDeployAppConfigs } = slice.actions;
const initAppConfig = defaultDeployAppConfig();
const must = mustSelectEntity(initAppConfig);
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[APP_CONFIG_NAME],
);
export const selectAppConfigById = must(selectors.selectById);

export const appConfigReducers = createReducerMap(slice);

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id");

export const appConfigEntities = {
  configuration: defaultEntity({
    id: "configuration",
    deserialize: deserializeAppConfig,
    save: addDeployAppConfigs,
  }),
};
