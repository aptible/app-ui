import { prettyDateTime } from "@app/date";
import {
  fetchApp,
  fetchImageById,
  fetchOperationById,
  selectAppById,
  selectImageById,
  selectOperationById,
} from "@app/deploy";
import { fetchDeploymentById, selectDeploymentById } from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import {
  appDetailDeploymentsUrl,
  appDetailUrl,
  deploymentDetailConfigUrl,
  deploymentDetailLogsUrl,
  sourceDetailUrl,
} from "@app/routes";
import { selectSourceById } from "@app/source";
import { capitalize } from "@app/string-utils";
import type { DeployApp, DeployOperation, Deployment } from "@app/types";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  DockerImage,
  GitCommitMessage,
  GitRef,
  OpStatus,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function DeploymentHeader({
  deployment,
  app,
  op,
}: { deployment: Deployment; app: DeployApp; op: DeployOperation }) {
  useQuery(fetchImageById({ id: deployment.imageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: deployment.imageId }),
  );
  const source = useSelector((s) =>
    selectSourceById(s, { id: deployment.sourceId }),
  );

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
        <DetailInfoItem title="Source">
          <Link to={sourceDetailUrl(source.id)}>{source.displayName}</Link>
        </DetailInfoItem>

        <DetailInfoItem title="App">
          <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Git Ref">
          <GitRef
            gitRef={deployment.gitRef}
            commitSha={deployment.gitCommitSha}
            commitUrl={deployment.gitCommitUrl}
          />
        </DetailInfoItem>

        <DetailInfoItem title="Created">
          {capitalize(prettyDateTime(deployment.createdAt))}
        </DetailInfoItem>
        <DetailInfoItem title="Commit Message">
          <div className="max-h-[21px]">
            <GitCommitMessage message={deployment.gitCommitMessage} />
          </div>
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <DetailInfoItem title="Docker Image">
          <DockerImage
            image={deployment.dockerImage}
            digest={image.dockerRef}
            repoUrl={deployment.dockerRepositoryUrl}
          />
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
