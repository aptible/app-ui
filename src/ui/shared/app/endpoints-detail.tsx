import { useQuery } from "saga-query/react";

import { fetchEndpointsByAppId, selectEndpointsByAppId } from "@app/deploy";
import { AppState, DeployApp } from "@app/types";

// TODO - use this in some way to prevent double load
import { LoadResources } from "../load-resources";

import { EndpointsView } from "../../shared";
import { useSelector } from "react-redux";

export function AppEndpointsOverview({ app }: { app: DeployApp }) {
  const query = useQuery(fetchEndpointsByAppId({ appId: app.id })); // need less crappy of doing this
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: app.id }),
  );

  return (
    <LoadResources query={query} isEmpty={false}>
      <EndpointsView endpoints={endpoints} parent={app.handle} />
    </LoadResources>
  );
}
