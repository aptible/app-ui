import {
  fetchDatabase,
  fetchEndpointsByEnvironmentId,
  fetchEnvironmentServices,
  selectDatabaseById,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { useParams } from "react-router-dom";

import { DatabaseEndpointsOverview, LoadResources } from "../shared";

export function DatabaseEndpointsPage() {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s) => selectDatabaseById(s, { id }));
  useQuery(fetchEnvironmentServices({ id: database.environmentId }));
  const query = useQuery(
    fetchEndpointsByEnvironmentId({ id: database.environmentId }),
  );

  return (
    <LoadResources query={query} isEmpty={false}>
      <DatabaseEndpointsOverview database={database} />
    </LoadResources>
  );
}
