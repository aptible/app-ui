import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { LinkResponse } from "@app/types";
import type { DeployDashboard } from "@app/types/deploy";

export interface DeployDashboardResponse {
  id: string;
  name: string;
  organization_id: string;
  resource_id: string;
  resource_type: string;
  symptoms: string;
  range_begin: string;
  range_end: string;
  observation_timestamp: string;
  data: object;
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
  symptoms: string;
  rangeBegin: string;
  rangeEnd: string;
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
    symptoms: "",
    range_begin: "",
    range_end: "",
    observation_timestamp: "",
    data: {},
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
    symptoms: response.symptoms,
    rangeBegin: response.range_begin,
    rangeEnd: response.range_end,
    observationTimestamp: response.observation_timestamp,
    data: response.data,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
};

export const selectDashboardsAsList = schema.dashboards.selectTableAsList;
export const selectDashboardById = schema.dashboards.selectById;

export const selectDashboardsByResourceAsList = createSelector(
  selectDashboardsAsList,
  (
    _: WebState,
    props: { resourceId: string; resourceType: string; timeRangeStart: string },
  ) => props,
  (dashboards, { resourceId, resourceType, timeRangeStart }) => {
    return dashboards.filter(
      (d) =>
        d.resourceId.toString() === resourceId &&
        d.resourceType === resourceType &&
        d.rangeEnd >= timeRangeStart,
    );
  },
);

export const createDashboard = api.post<
  CreateDashboardProps,
  DeployDashboardResponse
>("/dashboards", function* (ctx, next) {
  const {
    name,
    resourceId,
    resourceType,
    organizationId,
    symptoms,
    rangeBegin,
    rangeEnd,
  } = ctx.payload;
  const body = {
    name,
    resource_id: resourceId,
    resource_type: resourceType,
    symptoms: symptoms,
    observation_timestamp: rangeBegin,
    range_begin: rangeBegin,
    range_end: rangeEnd,
    organization_id: organizationId,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const dashboardId = ctx.json.value.id;
  ctx.loader = {
    message: `Dashboard created (dashboard ID: ${dashboardId})`,
    meta: { dashboardId: dashboardId },
  };
});

export const fetchDashboards = api.get("/dashboards?per_page=500&no_data=true");
export const fetchDashboardsWithData = api.get("/dashboards?per_page=100");

export const fetchDashboard = api.get<{ id: string }, DeployDashboardResponse>(
  "/dashboards/:id",
);

interface UpdateDashboard {
  id: string;
  data?: object;
  name?: string;
}

export const updateDashboard = api.put<UpdateDashboard>(
  "/dashboards/:id",
  function* (ctx, next) {
    const { data, name } = ctx.payload;
    const body: { data?: object; name?: string } = {};

    if (data) {
      body.data = data;
    }

    if (name) {
      body.name = name;
    }
    ctx.request = ctx.req({ body: JSON.stringify(body) });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = {
      message: "Saved changes successfully!",
    };
  },
);

export const deleteDashboard = api.delete<{
  id: string;
}>("/dashboards/:id", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  yield* schema.update(schema.dashboards.remove([ctx.payload.id]));
});

export const dashboardEntities = {
  dashboard: defaultEntity({
    id: "dashboard",
    deserialize: deserializeDeployDashboard,
    save: schema.dashboards.add,
  }),
};
