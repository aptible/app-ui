import { Link } from "react-router-dom";

import {
  hasDeployApp,
  hasDeployOperation,
  selectLatestDeployOp,
} from "@app/deploy";
import { appDeployResumeUrl } from "@app/routes";
import { AppState, DeployApp } from "@app/types";

import { useSelector } from "react-redux";
import { IconArrowRight } from "./icons";

export const OnboardingLink = ({ app }: { app: DeployApp }) => {
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  return (
    <Link to={appDeployResumeUrl(app.id)} className="flex items-center">
      {hasDeployOperation(deployOp) ? (
        <>
          View Status <IconArrowRight variant="sm" color="#4361FF" />
        </>
      ) : (
        <>
          Finish Setup <IconArrowRight variant="sm" color="#4361FF" />
        </>
      )}
    </Link>
  );
};
