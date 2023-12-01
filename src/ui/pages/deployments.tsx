import {
  fetchApps,
  fetchEnvironments,
  selectAppsByEnvOnboarding,
  selectLatestDeployOp,
} from "@app/deploy";
import { useLoader, useSelector } from "@app/react";
import { DeployApp } from "@app/types";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Loading,
  OnboardingLink,
  ResourceGroupBox,
  StatusPill,
  TitleBar,
  resolveOperationStatuses,
} from "../shared";

const DeploymentOverview = ({ app }: { app: DeployApp }) => {
  const deployOp = useSelector((s) =>
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

export const DeploymentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountIds =
    searchParams.get("accounts")?.split(",").filter(Boolean) || [];
  const apps = useSelector(selectAppsByEnvOnboarding);
  const envsLoader = useLoader(fetchEnvironments());
  const appsLoader = useLoader(fetchApps());
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
      <TitleBar description="Deployments can be in one of the following states: not deployed, queued, pending, or done.">
        Deployments
      </TitleBar>

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
