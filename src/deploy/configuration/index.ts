import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { schema } from "@app/schema";
import { TextVal } from "@app/string-utils";
import { DeployAppConfig, DeployAppConfigEnv, LinkResponse } from "@app/types";
import { parse } from "dotenv";

export interface DeployConfigurationResponse {
  id: number;
  env: { [key: string]: string | null };
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

export const configEnvToStr = (env: DeployAppConfigEnv): string => {
  return Object.keys(env)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      let value = String.raw`${env[key]}`;
      const prev = acc ? `${acc}\n` : "";
      if (value.includes("\n")) {
        value = `"${value}"`;
      }
      return `${prev}${key}=${value}`;
    }, "");
};

export const configStrToEnvList = (text: string): TextVal[] => {
  const items: TextVal[] = [];
  const output = parse(text);
  Object.keys(output).forEach((key) => {
    items.push({ key, value: output[key], meta: {} });
  });
  return items;
};

export const configEnvListToEnv = (
  next: TextVal[],
  cur: DeployAppConfigEnv = {},
): DeployAppConfigEnv => {
  const env: DeployAppConfigEnv = {};
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

export const selectAppConfigById = schema.appConfigs.selectById;

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id");

export const appConfigEntities = {
  configuration: defaultEntity({
    id: "configuration",
    deserialize: deserializeAppConfig,
    save: schema.appConfigs.add,
  }),
};
