import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { hasDeployApp, selectFirstAppByEnvId } from "@app/deploy";
import { selectLegacyDashboardUrl, selectOrigin } from "@app/env";
import { appDetailUrl, createProjectSetupUrl } from "@app/routes";
import { AppState, DeployEnvironment } from "@app/types";

import { IconArrowRight } from "./icons";

export const OnboardingLink = ({ env }: { env: DeployEnvironment }) => {
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const app = useSelector((s: AppState) =>
    selectFirstAppByEnvId(s, { envId: env.id }),
  );

  if (!hasDeployApp(app)) {
    return <span>No apps found</span>;
  }

  if (env.onboardingStatus === "completed") {
    if (origin === "app") {
      return (
        <a
          href={`${legacyUrl}/accounts/${env.id}/apps`}
          className="flex items-center"
        >
          View project <IconArrowRight variant="sm" color="#4361FF" />
        </a>
      );
    } else {
      return (
        <Link to={appDetailUrl(app.id)} className="flex items-center">
          View project <IconArrowRight variant="sm" color="#4361FF" />
        </Link>
      );
    }
  }

  return (
    <Link to={createProjectSetupUrl(env.id)} className="flex items-center">
      Finish setup <IconArrowRight variant="sm" color="#4361FF" />
    </Link>
  );
};
