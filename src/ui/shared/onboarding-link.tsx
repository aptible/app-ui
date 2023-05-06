import { Link } from "react-router-dom";

import { hasDeployApp, selectEnvironmentById } from "@app/deploy";
import { createProjectGitAppSetupUrl } from "@app/routes";
import { AppState, DeployApp } from "@app/types";

import { IconArrowRight } from "./icons";
import { useSelector } from "react-redux";

export const OnboardingLink = ({ app }: { app: DeployApp }) => {
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  return (
    <Link
      to={createProjectGitAppSetupUrl(app.id)}
      className="flex items-center"
    >
      {env.onboardingStatus === "completed" ? (
        <>
          View status <IconArrowRight variant="sm" color="#4361FF" />
        </>
      ) : (
        <>
          Finish setup <IconArrowRight variant="sm" color="#4361FF" />
        </>
      )}
    </Link>
  );
};
