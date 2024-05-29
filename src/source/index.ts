import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type { DeploySource } from "@app/types";

interface DeploySourceResponse {
  id: number;
  display_name: string;
  url: string;
  created_at: string;
  updated_at: string;
  _type: "source";
}

export const defaultDeploySourceResponse = (
  r: Partial<DeploySourceResponse> = {},
): DeploySourceResponse => {
  const now = new Date().toISOString();
  return {
    id: -1,
    display_name: "",
    url: "",
    created_at: now,
    updated_at: now,
    ...r,
    _type: "source",
  };
};

const deserializeDeploySource = (r: DeploySourceResponse): DeploySource => {
  return {
    id: `${r.id}`,
    displayName: r.display_name || "Unknown",
    url: r.url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const hasDeploySource = (a: DeploySource) => a.id !== "";

export const findSourceById = schema.sources.findById;
export const selectSourceById = schema.sources.selectById;
export const selectSources = schema.sources.selectTable;
export const selectSourcesAsList = schema.sources.selectTableAsList;

export const fetchSources = api.get("/sources");
export const fetchSourceById = api.get<{ id: string }>("/sources/:id");
export const fetchDeploymentsBySourceId = api.get<{ id: string }>(
  "/sources/:id/deployments",
);

export const entities = {
  source: defaultEntity({
    id: "source",
    save: schema.sources.add,
    deserialize: deserializeDeploySource,
  }),
};
