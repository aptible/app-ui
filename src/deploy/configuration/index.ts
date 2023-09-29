import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { TextVal } from "@app/string-utils";
import {
  AppState,
  DeployAppConfig,
  DeployAppConfigEnv,
  LinkResponse,
} from "@app/types";
import { selectDeploy } from "../slice";

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

export const configEnvToStr = (env: DeployAppConfigEnv) => {
  return Object.keys(env).reduce((acc, key) => {
    const value = env[key];
    const prev = acc ? `${acc}\n` : "";
    return `${prev}${key}=${value}`;
  }, "");
};

export const prepareConfigEnv = (cur: DeployAppConfigEnv, next: TextVal[]) => {
  const env: { [key: string]: any } = {};
  // the way to "remove" env vars from config is to set them as empty
  // so we do that here
  Object.keys(cur).forEach((key) => {
    env[key] = "";
  });

  next.forEach((e) => {
    env[e.key] = e.value;
  });

  return env;
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
