import { prettyDateTime } from "@app/date";
import {
  fetchApp,
  fetchOperationById,
  selectAppById,
  selectOperationById,
} from "@app/deploy";
import {
  fetchDeploymentById,
  getDockerImageName,
  selectDeploymentById,
} from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import {
  appDetailDeploymentsUrl,
  appDetailUrl,
  deploymentDetailConfigUrl,
  deploymentDetailLogsUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { DeployApp, DeployOperation, Deployment } from "@app/types";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  DeploymentGitSha,
  DeploymentTagText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  GitMetadata,
  OpStatus,
  SourceName,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function DeploymentHeader({
  deployment,
  app,
  op,
}: { deployment: Deployment; app: DeployApp; op: DeployOperation }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Deployment Details"
        icon={
          <img
            src={"/resource-types/logo-deployments.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="Deployment"
          />
        }
      />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">{capitalize(op.type)}</DetailInfoItem>
        <DetailInfoItem title="Created">
          {capitalize(prettyDateTime(deployment.createdAt))}
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <DetailInfoItem title="App">
          <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>

        <DetailInfoItem title="Source">
          <SourceName app={app} deployment={deployment} />
        </DetailInfoItem>
        {deployment.gitCommitMessage ? (
          <DetailInfoItem title="Commit Message">
            <div className="max-h-[21px]">
              <GitMetadata deployment={deployment} />
            </div>
          </DetailInfoItem>
        ) : null}
        <DetailInfoItem title="Tag">
          <DeploymentTagText deployment={deployment} />
        </DetailInfoItem>

        <DetailInfoItem title="Git Ref">
          <DeploymentGitSha deployment={deployment} />
        </DetailInfoItem>

        <DetailInfoItem title="Docker Image">
          {getDockerImageName(deployment)}
        </DetailInfoItem>

        <DetailInfoItem title="User">
          {op.userName}
          <div className="text-gray-500">Note: {op.note || "N/A"}</div>
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function DeploymentPageHeader() {
  const { id = "" } = useParams();
  const deployment = useSelector((s) => selectDeploymentById(s, { id }));
  const app = useSelector((s) => selectAppById(s, { id: deployment.appId }));
  useQuery(fetchApp({ id: deployment.appId }));
  const loader = useQuery(fetchDeploymentById({ id }));
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  useQuery(fetchOperationById({ id: deployment.operationId }));

  const tabs: TabItem[] = [
    { name: "Logs", href: deploymentDetailLogsUrl(id) },
    { name: "Configuration", href: deploymentDetailConfigUrl(id) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={[{ name: app.handle, to: appDetailDeploymentsUrl(app.id) }]}
      title={`Deployment ${id}`}
      detailsBox={
        <DeploymentHeader deployment={deployment} op={op} app={app} />
      }
      tabs={tabs}
    />
  );
}

export const DeploymentDetailLayout = () => {
  return (
    <AppSidebarLayout header={<DeploymentPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
