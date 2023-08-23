import { useParams } from "react-router-dom";

import { fetchEndpointsByAppId } from "@app/deploy";
import { useQuery } from "@app/fx";

import { EndpointsByApp } from "../shared";

export function AppDetailEndpointsPage() {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByAppId({ appId: id }));
  return <EndpointsByApp appId={id} />;
}
