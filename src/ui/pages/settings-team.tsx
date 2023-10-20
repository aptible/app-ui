import { teamMembersUrl } from "@app/routes";
import { Navigate } from "react-router";

export function TeamPage() {
  return <Navigate to={teamMembersUrl()} replace />;
}
