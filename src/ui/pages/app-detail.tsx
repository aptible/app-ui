import { appDetailDeploymentsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export const AppDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={appDetailDeploymentsUrl(id)} replace />;
};
