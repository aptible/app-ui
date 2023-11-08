import { appDeployWithGitUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";

export const AppDeployGetStartedPage = () => {
  const { appId = "" } = useParams();
  return <Navigate to={appDeployWithGitUrl(appId)} replace />;
};
