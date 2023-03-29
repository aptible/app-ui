import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";

import {
  fetchDatabase,
  fetchEndpointsByEnvironmentId,
  fetchEndpointsByServiceId,
  fetchEnvironmentServices,
  selectDatabaseById,
  selectEndpointsByServiceIds,
} from "@app/deploy";
import { AppState, DeployDatabase } from "@app/types";

import { DetailPageSections, EndpointsView, LoadResources } from "../shared";

const DatabasePageContent = ({ database }: { database: DeployDatabase }) => {
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByServiceIds(s, { ids: [database.serviceId] }),
  );

  return (
    <DetailPageSections>
      <EndpointsView endpoints={endpoints} parent="database" />
    </DetailPageSections>
  );
};

export function DatabaseDetailPage() {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchEnvironmentServices({ id: database.environmentId }));
  const query = useQuery(
    fetchEndpointsByEnvironmentId({ id: database.environmentId }),
  );

  return (
    <LoadResources query={query} isEmpty={false}>
      <DatabasePageContent database={database} />
    </LoadResources>
  );
}
