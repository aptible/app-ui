import { api } from "@app/api";
import { defaultEntity, defaultHalHref } from "@app/hal";
import { schema } from "@app/schema";
import type { LinkResponse } from "@app/types";
import type { DeployDashboard } from "@app/types/deploy";

export interface DeployDashboardResponse {
  id: string;
  name: string;
  organization_id: string;
  resource_id: string;
  resource_type: string;
  created_at: string;
  updated_at: string;
  _links: {
    resource: LinkResponse;
  };
  _type: "dashboard";
}

export interface CreateDashboardProps {
  name: string;
  resourceId: string;
  resourceType: string;
  organizationId: string;
}

export const defaultDashboardResponse = (
  d: Partial<DeployDashboardResponse> = {},
): DeployDashboardResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    organization_id: "",
    resource_id: "",
    resource_type: "",
    created_at: now,
    updated_at: now,
    _type: "dashboard",
    ...d,
    _links: {
      resource: defaultHalHref(),
      ...d._links,
    },
  };
};

export const deserializeDeployDashboard = (
  response: DeployDashboardResponse,
): DeployDashboard => {
  return {
    id: `${response.id}`,
    name: response.name,
    organizationId: response.organization_id,
    resourceId: response.resource_id,
    resourceType: response.resource_type,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
};

export const createDashboard = api.post<
  CreateDashboardProps,
  DeployDashboardResponse
>("/dashboards", function* (ctx, next) {
  const { name, resourceId, resourceType, organizationId } = ctx.payload;
  const body = {
    name,
    resource_id: resourceId,
    resource_type: resourceType,
    organization_id: organizationId,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
});

export const selectDashboardsAsList = schema.dashboards.selectTableAsList;
export const fetchDashboards = api.get("/dashboards");

export const dashboardEntities = {
  dashboard: defaultEntity({
    id: "dashboard",
    deserialize: deserializeDeployDashboard,
    save: schema.dashboards.add,
  }),
}; 
