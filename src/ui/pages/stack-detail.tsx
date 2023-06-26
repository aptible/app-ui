import { Navigate, useParams } from "react-router";

import { stackDetailEnvsUrl } from "@app/routes";

export const StackDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={stackDetailEnvsUrl(id)} replace />;
};
