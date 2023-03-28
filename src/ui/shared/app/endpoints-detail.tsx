import { useQuery } from "saga-query/react";

import { fetchEndpointsByAppId } from "@app/deploy";
import { DeployApp } from "@app/types";

import { EndpointsOverview } from "../../shared";

export function AppEndpointsOverview({ app }: { app: DeployApp }) {
  const query = useQuery(fetchEndpointsByAppId({ appId: app.id }));
  return <EndpointsOverview query={query} serviceIds={app.serviceIds} />;
}
