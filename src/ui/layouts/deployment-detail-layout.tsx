import { prettyEnglishDateWithTime } from "@app/date";
import {
  fetchApp,
  fetchOperationById,
  selectAppById,
  selectOperationById,
} from "@app/deploy";
import { fetchDeploymentById, selectDeploymentById } from "@app/deployment";
import { useQuery } from "@app/fx";
import {
  appDetailDeploymentsUrl,
  appDetailUrl,
  deploymentDetailConfigUrl,
  deploymentDetailLogsUrl,
  deploymentDetailRollbackUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type {
  AppState,
  DeployApp,
  DeployOperation,
  Deployment,
} from "@app/types";
import { useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  OpStatus,
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
            src={"/resource-types/logo-activity.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="Deployment"
          />
        }
      />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">{capitalize(op.type)}</DetailInfoItem>
        <DetailInfoItem title="Created">
          {capitalize(prettyEnglishDateWithTime(deployment.createdAt))}
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>

        <DetailInfoItem title="App">
          <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
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
  const deployment = useSelector((s: AppState) =>
    selectDeploymentById(s, { id }),
  );
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: deployment.appId }),
  );
  useQuery(fetchApp({ id: deployment.appId }));
  const loader = useQuery(fetchDeploymentById({ id }));
  const op = useSelector((s: AppState) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  useQuery(fetchOperationById({ id: deployment.operationId }));

  const tabs: TabItem[] = [
    { name: "Logs", href: deploymentDetailLogsUrl(id) },
    { name: "Configuration", href: deploymentDetailConfigUrl(id) },
    { name: "Rollback", href: deploymentDetailRollbackUrl(id) },
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
