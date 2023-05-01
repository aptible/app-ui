import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { hasDeployApp, selectFirstAppByEnvId } from "@app/deploy";
import { createProjectGitStatusUrl } from "@app/routes";
import { AppState, DeployEnvironment } from "@app/types";

import { IconArrowRight } from "./icons";

export const OnboardingLink = ({ env }: { env: DeployEnvironment }) => {
  const app = useSelector((s: AppState) =>
    selectFirstAppByEnvId(s, { envId: env.id }),
  );

  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  return (
    <Link to={createProjectGitStatusUrl(app.id)} className="flex items-center">
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
