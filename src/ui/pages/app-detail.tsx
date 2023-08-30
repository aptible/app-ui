import { Navigate, useParams } from "react-router"
import { appServicesUrl } from "@app/routes";

export const AppDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate to={appServicesUrl(id)} replace />
}
