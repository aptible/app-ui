import { api, cacheTimer } from "@app/api";
import { defaultEntity, defaultHalHref } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { LinkResponse, ManualScaleRecommendation } from "@app/types";
import { createSelector } from "starfx";

export interface DeployManualScaleRecommendationResponse {
  id: number;
  service_id: number;
  cpu_usage: number;
  ram_usage: number;
  ram_target: number;
  recommended_instance_class: string;
  recommended_container_memory_limit_mb: number;
  cost_savings: number;
  metric_percentile: number;
  created_at: string;
  updated_at: string;
  _links: {
    service: LinkResponse;
  };
  _type: "manual_service_sizing_recommendation";
}

export const defaultManualScaleRecommendationResponse = (
  s: Partial<DeployManualScaleRecommendationResponse> = {},
): DeployManualScaleRecommendationResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    service_id: 0,
    cpu_usage: 0,
    ram_usage: 0,
    ram_target: 0,
    recommended_instance_class: "",
    recommended_container_memory_limit_mb: 0,
    cost_savings: 0,
    metric_percentile: 0,
    created_at: now,
    updated_at: now,
    _links: {
      service: defaultHalHref(),
    },
    ...s,
    _type: "manual_service_sizing_recommendation",
  };
};

export const deserializeManualScaleRecommendation = (
  payload: DeployManualScaleRecommendationResponse,
): ManualScaleRecommendation => {
  return {
    id: `${payload.id}`,
    serviceId: `${payload.service_id}`,
    cpuUsage: payload.cpu_usage,
    ramUsage: payload.ram_usage,
    ramTarget: payload.ram_target,
    recommendedInstanceClass: payload.recommended_instance_class,
    recommendedContainerMemoryLimitMb:
      payload.recommended_container_memory_limit_mb,
    costSavings: payload.cost_savings,
    metricPercentile: payload.metric_percentile,
    createdAt: payload.created_at,
  };
};

export const manualScaleRecommendationEntities = {
  manual_service_sizing_recommendation: defaultEntity({
    id: "manual_service_sizing_recommendation",
    deserialize: deserializeManualScaleRecommendation,
    save: schema.manualScaleRecommendations.add,
  }),
};

export const selectManualScaleRecommendationByServiceId = createSelector(
  schema.manualScaleRecommendations.selectTableAsList,
  (_: WebState, p: { serviceId: string }) => p.serviceId,
  (recs, serviceId) =>
    recs.find((r) => {
      return r.serviceId === serviceId;
    }) || schema.manualScaleRecommendations.empty,
);

export const fetchManualScaleRecommendations = api.get(
  "/manual_service_sizing_recommendations?per_page=5000",
  { supervisor: cacheTimer() },
);

export const fetchManualScaleRecommendationById = api.get<{
  id: string;
}>("/manual_service_sizing_recommendations/:id");
