import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchDatabase,
  fetchEndpointsByEnvironmentId,
  fetchEnvironmentServices,
  selectDatabaseById,
  selectEndpointsByServiceIds,
} from "@app/deploy";
import { AppState, DeployDatabase } from "@app/types";

import { DetailPageSections, EndpointsView, LoadResources } from "../shared";

const DatabaseEndpointsPageContent = ({
  database,
}: { database: DeployDatabase }) => {
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByServiceIds(s, { ids: [database.serviceId] }),
  );

  return (
    <DetailPageSections>
      <EndpointsView endpoints={endpoints} parent="database" />
    </DetailPageSections>
  );
};

export function DatabaseEndpointsPage() {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchEnvironmentServices({ id: database.environmentId }));
  const query = useQuery(
    fetchEndpointsByEnvironmentId({ id: database.environmentId }),
  );

  return (
    <LoadResources query={query} isEmpty={false}>
      <DatabaseEndpointsPageContent database={database} />
    </LoadResources>
  );
}
