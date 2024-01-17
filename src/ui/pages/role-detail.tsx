import { roleDetailMembersUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export function RoleDetailPage() {
  const { id = "" } = useParams();
  return <Navigate to={roleDetailMembersUrl(id)} replace />;
}
