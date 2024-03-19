import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import { DeploySource } from "@app/types";

interface DeploySourceResponse {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  _type: "source";
}

export const defaultDeploySourceResponse = (
  r: Partial<DeploySourceResponse> = {},
): DeploySourceResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    display_name: "",
    created_at: now,
    updated_at: now,
    ...r,
    _type: "source",
  };
};

const deserializeDeploySource = (r: DeploySourceResponse): DeploySource => {
  return {
    id: r.id,
    displayName: r.display_name || "Unknown",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const hasDeploySource = (a: DeploySource) => a.id !== "";

export const selectSourceById = schema.sources.selectById;
export const selectSourcesAsList = schema.sources.selectTableAsList;

export const fetchSources = api.get("/sources");
export const fetchSourceById = api.get<{ id: string }>("/sources/:id");

export const entities = {
  source: defaultEntity({
    id: "source",
    save: schema.sources.add,
    deserialize: deserializeDeploySource,
  }),
};
