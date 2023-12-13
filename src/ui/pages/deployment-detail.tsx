import { deploymentDetailLogsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export function DeploymentDetailPage() {
  const { id = "" } = useParams();
  return <Navigate to={deploymentDetailLogsUrl(id)} replace />;
}
