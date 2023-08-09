import { Navigate, useParams } from "react-router";

import { endpointDetailActivityUrl } from "@app/routes";

export const EndpointDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={endpointDetailActivityUrl(id)} replace />;
};
