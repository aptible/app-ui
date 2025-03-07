import { environmentsUrl } from "@app/routes";
import { Navigate } from "react-router";

export const HomePage = () => {
  return <Navigate to={environmentsUrl()} replace />;
};
