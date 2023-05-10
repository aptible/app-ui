import { Link } from "react-router-dom";

import {
  hasDeployApp,
  hasDeployOperation,
  selectLatestDeployOp,
} from "@app/deploy";
import { createProjectGitAppSetupUrl } from "@app/routes";
import { AppState, DeployApp } from "@app/types";

import { IconArrowRight } from "./icons";
import { useSelector } from "react-redux";

export const OnboardingLink = ({ app }: { app: DeployApp }) => {
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  return (
    <Link
      to={createProjectGitAppSetupUrl(app.id)}
      className="flex items-center"
    >
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
