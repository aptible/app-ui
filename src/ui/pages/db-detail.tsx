import { Navigate, useParams } from "react-router"
import { databaseMetricsUrl } from "@app/routes";

export const DatabaseDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={databaseMetricsUrl(id)} replace />
}
