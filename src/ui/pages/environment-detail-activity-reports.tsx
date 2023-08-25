import {
  ActivityReportListByEnvironment,
  DetailPageSections,
  tokens,
} from "../shared";
import {
  fetchEnvActivityReports,
  selectActivityReportsByEnvId,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

const ActivityReportsHeader = () => (
  <div className="bg-white py-8 px-8 shadow border border-black-100 rounded-lg">
    <h3 className={tokens.type.h3}>Activity Reports</h3>
    <div className="mt-4">
      Activity Reports are CSV downloads that list all operations that took
      place in this environment over a reporting period.
    </div>
    <div className="mt-4">They are posted here on a weekly basis.</div>
  </div>
);

export const EnvironmentActivityReportsPage = () => {
  const { id = "" } = useParams();
  const reports = useSelector((s: AppState) =>
    selectActivityReportsByEnvId(s, { envId: id }),
  );
  useQuery(fetchEnvActivityReports({ id }));
  return (
    <div className="mb-4">
      <DetailPageSections>
        <ActivityReportsHeader />
        <ActivityReportListByEnvironment reports={reports} />
      </DetailPageSections>
    </div>
  );
};
