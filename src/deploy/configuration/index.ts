import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { db } from "@app/schema";
import { TextVal } from "@app/string-utils";
import { DeployAppConfig, DeployAppConfigEnv, LinkResponse } from "@app/types";

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

export const selectAppConfigById = db.appConfigs.selectById;

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id");

export const appConfigEntities = {
  configuration: defaultEntity({
    id: "configuration",
    deserialize: deserializeAppConfig,
    save: db.appConfigs.add,
  }),
};
