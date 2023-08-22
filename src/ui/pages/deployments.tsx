import { MenuWrappedPage } from "../layouts/menu-wrapped-page";
import {
  Button,
  ButtonLink,
  IconPlusCircle,
  Loading,
  resolveOperationStatuses,
  tokens,
} from "../shared";
import { OnboardingLink } from "../shared/onboarding-link";
import { StatusPill } from "../shared/pill";
import { ResourceGroupBox } from "../shared/resource-group-box";
import {
  fetchAllApps,
  fetchAllEnvironments,
  fetchEndpointsByAppId,
  selectAppsByEnvOnboarding,
  selectLatestDeployOp,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import { createProjectGitUrl } from "@app/routes";
import { AppState, DeployApp } from "@app/types";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const DeploymentOverview = ({ app }: { app: DeployApp }) => {
  useQuery(fetchEndpointsByAppId({ appId: app.id }));
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const [status, dateStr] = resolveOperationStatuses([deployOp]);

  return (
    <ResourceGroupBox
      handle={app.handle}
      appId={app.id}
      status={<StatusPill status={status} from={dateStr} />}
    >
      <div className="mt-4">
        <OnboardingLink app={app} />
      </div>
    </ResourceGroupBox>
  );
};

interface DeploymentPageProps {
  leftAlignTitle?: boolean;
  showDeployButton?: boolean;
  headerStyle?: string;
}

export const DeploymentsPage = ({
  headerStyle = tokens.type.h1,
  leftAlignTitle = false,
  showDeployButton = true,
}: DeploymentPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountIds =
    searchParams.get("accounts")?.split(",").filter(Boolean) || [];
  const apps = useSelector(selectAppsByEnvOnboarding);
  const envsLoader = useLoader(fetchAllEnvironments());
  const appsLoader = useLoader(fetchAllApps());
  const filteredApps = apps.filter((app) => {
    if (accountIds.length === 0) return true;
    return accountIds.includes(app.environmentId);
  });
  const resetFilter = () => {
    setSearchParams({});
  };

  const view = () => {
    if (envsLoader.isInitialLoading || appsLoader.isInitialLoading) {
      return (
        <div className="mt-4">
          <Loading text="Loading ..." />
        </div>
      );
    } else if (apps.length === 0) {
      return <div className="mt-4">No deployments found</div>;
    }

    return null;
  };

  return (
    <div>
      <h1
        className={`${headerStyle} mb-4 ${leftAlignTitle ? "" : "text-center"}`}
      >
        Deployments
      </h1>
      {showDeployButton ? (
        <ButtonLink to={createProjectGitUrl()}>
          <IconPlusCircle className="mr-2" /> Deploy
        </ButtonLink>
      ) : null}

      {view()}

      {accountIds.length > 0 && apps.length > 0 ? (
        <Button
          variant="white"
          size="sm"
          onClick={resetFilter}
          className="mt-4 mb-2"
        >
          Show All
        </Button>
      ) : (
        <div className="mt-4" />
      )}

      <div>
        {filteredApps.map((app) => (
          <DeploymentOverview key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};

export const DeploymentsPageWithMenus = () => (
  <MenuWrappedPage>
    <DeploymentsPage
      headerStyle={tokens.type.h2}
      leftAlignTitle
      showDeployButton={false}
    />
  </MenuWrappedPage>
);
