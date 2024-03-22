import { hostingUrl } from "@app/routes";
import { Navigate } from "react-router";

export const HomePage = () => {
  return <Navigate to={hostingUrl()} replace />;
};
