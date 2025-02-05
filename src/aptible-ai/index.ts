import { aptibleAiApi } from "@app/api";
import type { Dashboard } from "@app/types";

export const createDashboard = aptibleAiApi.post<{
  symptoms: string;
  appId: string;
  start: Date;
  end: Date;
}>("/app/dashboards/create_dashboard/", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      symptoms: ctx.payload.symptoms,
      app_id: ctx.payload.appId,
      start: ctx.payload.start,
      end: ctx.payload.end,
    }),
  });

  ctx.cache = true;

  yield* next();
});

// TODO: Figure out how to get a status code from an action, so that we can swap
// out the fetch implementation in the diagnostics detail page.
export const pollDashboard = aptibleAiApi.get<{
  id: number;
}>("/app/dashboards/:id/", function* (ctx, next) {
  yield* next();
});

export interface DashboardResponse {
  id: number;
}

export const defaultDashboardResponse = (
  p: Partial<DashboardResponse> = {},
): DashboardResponse => {
  return {
    id: -1,
    ...p,
  };
};

export const deserializeDashboard = (payload: DashboardResponse): Dashboard => {
  return {
    id: `${payload.id}`,
  };
};

export type Message = {
  id: string;
  severity: string;
  message: string;
};

export type Operation = {
  id: number;
  status: string;
  created_at: string;
  description: string;
  log_lines: string[];
};

export type Point = {
  timestamp: string;
  value: number;
};

export type Series = {
  label: string;
  description: string;
  interpretation: string;
  annotations: Annotation[];
  points: Point[];
};

export type Plot = {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  analysis: string;
  unit: string;
  series: Series[];
  annotations: Annotation[];
};

export type Resource = {
  id: string;
  type: string;
  notes: string;
  plots: {
    [key: string]: Plot;
  };
  operations: Operation[];
};

export type Annotation = {
  label: string;
  description: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};
