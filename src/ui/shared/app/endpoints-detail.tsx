import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";

import { fetchEndpointsByAppId, selectEndpointsByAppId } from "@app/deploy";
import { AppState, DeployApp } from "@app/types";

import { EndpointsView } from "../endpoints-overview";
import { LoadResources } from "../load-resources";

export function AppEndpointsOverview({ app }: { app: DeployApp }) {
  const query = useQuery(fetchEndpointsByAppId({ appId: app.id }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: app.id }),
  );

  return (
    <LoadResources query={query} isEmpty={false}>
      <EndpointsView endpoints={endpoints} parent={app.handle} />
    </LoadResources>
  );
}
