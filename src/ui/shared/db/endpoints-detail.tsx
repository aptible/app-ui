import { fetchEndpointsByServiceId } from "@app/deploy";
import { useQuery } from "@app/fx";
import { DeployDatabase } from "@app/types";

import { EndpointsByDbService } from "../endpoint";

export function DatabaseEndpointsOverview({
  database,
}: { database: DeployDatabase }) {
  useQuery(fetchEndpointsByServiceId({ id: database.serviceId }));
  return <EndpointsByDbService serviceId={database.serviceId} dbId={database.id}/>;
}
