import { stackDetailEnvsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export const StackDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={stackDetailEnvsUrl(id)} replace />;
};
