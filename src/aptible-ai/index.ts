import { aptibleAiApi } from "@app/api";
import { Dashboard } from "@app/types";


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

export const deserializeDashboard = (
  payload: DashboardResponse,
): Dashboard => {
  return {
    id: `${payload.id}`,
  };
};
