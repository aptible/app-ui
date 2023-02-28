import { api, cacheTimer } from "@app/api";
import { LinkResponse } from "@app/types";

export interface DeployConfigurationResponse {
  id: number;
  env: { [key: string]: string | number | boolean };
  _links: {
    resource: LinkResponse;
  };
}

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id", { saga: cacheTimer() }, api.cache());
