import { Link } from "react-router-dom";

import { hasDeployApp } from "@app/deploy";
import { createProjectGitAppSetupUrl } from "@app/routes";
import { DeployApp } from "@app/types";

import { IconArrowRight } from "./icons";

export const OnboardingLink = ({ app }: { app: DeployApp }) => {
  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  return (
    <Link
      to={createProjectGitAppSetupUrl(app.id)}
      className="flex items-center"
    >
      {app.lastDeployOperation ? (
        <>
          View status <IconArrowRight variant="sm" color="#4361FF" />
        </>
      ) : (
        <>
          Finish Setup <IconArrowRight variant="sm" color="#4361FF" />
        </>
      )}
    </Link>
  );
};
