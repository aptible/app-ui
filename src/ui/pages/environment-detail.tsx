import { environmentAppsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export const EnvironmentDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={environmentAppsUrl(id)} replace />;
};
