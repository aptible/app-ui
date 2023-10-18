import { createAppUrl, envSelectUrl } from "@app/routes";
import { Navigate } from "react-router";
import { useSearchParams } from "react-router-dom";

export const DeployPage = () => {
  const [params] = useSearchParams();
  const stackId = params.get("stack_id") || "";
  const envId = params.get("environment_id") || "";

  if (stackId && envId) {
    return (
      <Navigate
        to={createAppUrl(`stack_id=${stackId}&environment_id=${envId}`)}
      />
    );
  }

  return <Navigate to={envSelectUrl(stackId ? `stack_id=${stackId}` : "")} />;
};
