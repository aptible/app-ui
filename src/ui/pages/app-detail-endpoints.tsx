import { fetchEndpointsByAppId } from "@app/deploy";
import { useQuery } from "@app/react";
import { useParams } from "react-router-dom";
import { EndpointsByApp } from "../shared";

export function AppDetailEndpointsPage() {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByAppId({ appId: id }));
  return <EndpointsByApp appId={id} />;
}
