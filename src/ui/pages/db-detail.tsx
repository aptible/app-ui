import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";

import {
  fetchDatabase,
  hasDeployDatabase,
  selectDatabaseById,
} from "@app/deploy";
import { AppState, DeployDatabase } from "@app/types";

import { DetailPageSections, EndpointsView } from "../shared";

const DatabasePageContent = ({ database }: { database: DeployDatabase }) => (
  <DetailPageSections>
    <EndpointsView serviceId={database.serviceId} />
  </DetailPageSections>
);

export function DatabaseDetailPage() {
  const { id = "" } = useParams();
  const { isInitialLoading, message } = useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  if (hasDeployDatabase(database)) {
    return <DatabasePageContent database={database} />;
  }

  if (isInitialLoading) {
    return <span>Loading...</span>;
  }
  return <span>{message || "Something went wrong"}</span>;
}
