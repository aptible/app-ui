import { appServicePathMetricsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  return <Navigate to={appServicePathMetricsUrl(id, serviceId)} replace />;
}
