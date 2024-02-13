import { PaginateProps, api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { DeployActivityReport, HalEmbedded, LinkResponse } from "@app/types";

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

export const selectActivityReportById = schema.activityReports.selectById;
export const selectActivityReportsByIds = schema.activityReports.selectByIds;
export const findActivityReportById = schema.activityReports.findById;
export const selectActivityReportsAsList =
  schema.activityReports.selectTableAsList;
export const selectActivityReports = schema.activityReports.selectTable;

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

export const fetchEnvActivityReports = api.get<
  { id: string } & PaginateProps,
  HalEmbedded<{ activity_reports: DeployActivityReport[] }>
>("/accounts/:id/activity_reports?page=:page", function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.activity_reports.map((ac) => `${ac.id}`);
  const paginatedData = {
    ...ctx.json.value,
    _embedded: { activity_reports: ids },
  };
  yield* schema.update(schema.cache.add({ [ctx.key]: paginatedData }));
});

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
    save: schema.activityReports.add,
  }),
};
