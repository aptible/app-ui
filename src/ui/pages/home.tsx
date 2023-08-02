import { Navigate } from "react-router";

import { createProjectDeploymentsUrl } from "@app/routes";
import { useSearchParams } from "react-router-dom";

export const HomePage = () => {
  const [params] = useSearchParams();
  // TODO: replace with appsUrl()
  return <Navigate to={createProjectDeploymentsUrl(`${params}`)} replace />;
};
