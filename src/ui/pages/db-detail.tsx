import { databaseMetricsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export const DatabaseDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={databaseMetricsUrl(id)} replace />;
};
