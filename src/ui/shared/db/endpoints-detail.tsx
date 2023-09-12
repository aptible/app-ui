import { fetchEndpointsByDatabaseId } from "@app/deploy";
import { useQuery } from "@app/fx";
import { DeployDatabase } from "@app/types";

import { EndpointsByDatabase } from "../endpoint";

export function DatabaseEndpointsOverview({
  database,
}: { database: DeployDatabase }) {
  useQuery(fetchEndpointsByDatabaseId({ dbId: database.id }));
  return <EndpointsByDatabase dbId={database.id} />;
}
