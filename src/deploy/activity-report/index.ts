import { selectDeploy } from "../slice";
import { api, cacheTimer } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployActivityReport, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

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

export const defaultDeployActivityReport = (
  ld: Partial<DeployActivityReport> = {},
): DeployActivityReport => {
  const now = new Date().toISOString();
  return {
    id: "",
    startsAt: now,
    endsAt: now,
    filename: "",
    environmentId: "",
    createdAt: now,
    updatedAt: now,
    ...ld,
  };
};

export const DEPLOY_ACTIVITY_REPORT_NAME = "activityReports";
const slice = createTable<DeployActivityReport>({
  name: DEPLOY_ACTIVITY_REPORT_NAME,
});
const { add: addDeployActivityReports } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ACTIVITY_REPORT_NAME],
);
const initActivityReport = defaultDeployActivityReport();
const must = mustSelectEntity(initActivityReport);
export const selectActivityReportById = must(selectors.selectById);
export const findActivityReportById = must(selectors.findById);
export const activityReportReducers = createReducerMap(slice);
export const {
  selectTableAsList: selectActivityReportsAsList,
  selectTable: selectActivityReports,
} = selectors;

export const selectActivityReportsByEnvId = createSelector(
  selectActivityReportsAsList,
  (_: AppState, props: { envId: string }) => props.envId,
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
    saga: cacheTimer(),
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

    const url = ctx.json.data;

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
    save: addDeployActivityReports,
  }),
};
