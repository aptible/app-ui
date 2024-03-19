import { sourceDetailAppsUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";
import { AppListBySource } from "../shared";

export function SourceDetailPage() {
  const { id = "" } = useParams();
  return <Navigate to={sourceDetailAppsUrl(id)} replace />;
}

export function SourceDetailAppsPage() {
  const { id = "" } = useParams();
  return <AppListBySource sourceId={id} />;
}
