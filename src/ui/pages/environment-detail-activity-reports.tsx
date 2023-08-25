import {
  ActivityReportListByEnvironment,
  DetailPageSections,
} from "../shared";
import {
  fetchEnvActivityReports,
  selectActivityReportsByEnvId,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export const EnvironmentActivityReportsPage = () => {
  const { id = "" } = useParams();
  const reports = useSelector((s: AppState) =>
    selectActivityReportsByEnvId(s, { envId: id }),
  );
  useQuery(fetchEnvActivityReports({ id }));
  return (
    <div className="-mt-2">
      <DetailPageSections>
        <ActivityReportListByEnvironment reports={reports} />
      </DetailPageSections>
    </div>
  );
};
