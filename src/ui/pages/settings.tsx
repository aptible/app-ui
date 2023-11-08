import { settingsProfileUrl } from "@app/routes";
import { Navigate } from "react-router";

export function SettingsPage() {
  return <Navigate to={settingsProfileUrl()} replace />;
}
