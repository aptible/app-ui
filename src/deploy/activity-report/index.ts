import { api, cacheTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, db } from "@app/schema";
import { DeployActivityReport, LinkResponse } from "@app/types";

export interface DeployActivityReportResponse {
  id: string;
  starts_at: string;
  ends_at: string;
  filename: string;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
}

export const deserializeActivityReport = (
  payload: DeployActivityReportResponse,
): DeployActivityReport => {
  const links = payload._links;
  return {
    id: payload.id,
    startsAt: payload.starts_at,
    endsAt: payload.ends_at,
    filename: payload.created_at,
    // keep the URL here, we're going to use it do a get, and then read it and follow it
    environmentId: extractIdFromLink(links.account),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const selectActivityReportById = db.activityReports.selectById;
export const findActivityReportById = db.activityReports.findById;
export const selectActivityReportsAsList = db.activityReports.selectTableAsList;
export const selectActivityReports = db.activityReports.selectTable;

export const selectActivityReportsByEnvId = createSelector(
  selectActivityReportsAsList,
  (_: WebState, props: { envId: string }) => props.envId,
  (activityReports, envId) => {
    return activityReports
      .filter((activityReport) => activityReport.environmentId === envId)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  },
);
export const fetchEnvActivityReports = api.get<{ id: string }>(
  "/accounts/:id/activity_reports",
  {
    supervisor: cacheTimer(),
  },
);
export const downloadActivityReports = api.get<
  { id: string; filename: string },
  string
>("/activity_reports/:id/download", [
  function* (ctx, next) {
    const { filename } = ctx.payload;
    ctx.bodyType = "text";

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const url = ctx.json.value;
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    link.remove();
  },
]);

export const activityReportEntities = {
  activity_report: defaultEntity({
    id: "activity_report",
    deserialize: deserializeActivityReport,
    save: db.activityReports.add,
  }),
};
