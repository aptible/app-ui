import { useParams } from "react-router";
import { EndpointsByEnv } from "../shared";

export const EnvironmentEndpointsPage = () => {
  const { id = "" } = useParams();
  return <EndpointsByEnv envId={id} />;
};
