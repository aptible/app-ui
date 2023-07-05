import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { timeAgo } from "@app/date";
import {
  fetchAllApps,
  fetchEndpointsByEnvironmentId,
  fetchEnvironmentById,
  fetchEnvironmentOperations,
  selectEndpointsByEnvironmentId,
  selectEnvironmentById,
  selectLatestSuccessDeployOpByEnvId,
  selectStackById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { stackDetailEnvsUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import {
  AppState,
  DeployEndpoint,
  DeployEnvironment,
  DeployOperation,
  DeployStack,
} from "@app/types";

import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";

import { MenuWrappedPage } from "./menu-wrapped-page";

const EndpointList = ({ endpoint }: { endpoint: DeployEndpoint }) =>
  endpoint.type === "tcp" ? (
    <div>{endpoint.externalHost}</div>
  ) : (
    <p key={endpoint.id}>
      <a
        href={`https://${endpoint.virtualDomain}`}
        target="_blank"
        rel="noreferrer"
      >
        {endpoint.virtualDomain}
      </a>
    </p>
  );

export function EnvHeader({
  environment,
  latestOperation,
  stack,
  endpoints,
}: {
  environment: DeployEnvironment;
  latestOperation: DeployOperation;
  stack: DeployStack;
  endpoints: DeployEndpoint[];
}) {
  const userName = latestOperation.userName.slice(0, 15);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Environment Details"
        icon={
          <img
            src={"/resource-types/logo-environment.png"}
            className="w-8 h-8 mr-3"
            aria-label="Environment"
          />
        }
        docsUrl="https://www.aptible.com/docs/environments"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{environment.id}</DetailInfoItem>
        <DetailInfoItem
          title={`${environment.totalAppCount} App${environment.totalAppCount > 0 && "s"
            }`}
        >
          Using {environment.appContainerCount} container
          {environment.appContainerCount > 0 && "s"}
        </DetailInfoItem>
        <DetailInfoItem title="Backups">
          {environment.totalBackupSize} GB
        </DetailInfoItem>

        <DetailInfoItem title="Stack">{stack.name}</DetailInfoItem>
        <DetailInfoItem
          title={`${environment.totalDatabaseCount} Database${environment.totalDatabaseCount > 0 && "s"
            }`}
        >
          {environment.databaseContainerCount} container
          {environment.databaseContainerCount > 0 && "s"} using{" "}
          {environment.totalDiskSize} GB of disk
        </DetailInfoItem>
        <div />

        <DetailInfoItem title="Last Deployed">
          {timeAgo(latestOperation.createdAt)} by {capitalize(userName)}
        </DetailInfoItem>
        <DetailInfoItem
          title={`${endpoints.length} Endpoint${environment.totalAppCount > 0 ? "s" : ""
            }`}
        >
          {endpoints.length <= 5
            ? endpoints.map((endpoint) => <EndpointList endpoint={endpoint} />)
            : null}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function EnvironmentPageHeader(): React.ReactElement {
  const { id = "" } = useParams();
  useQuery(fetchEnvironmentById({ id }));
  useQuery(fetchAllApps());
  useQuery(fetchEndpointsByEnvironmentId({ id }));
  useQuery(fetchEnvironmentOperations({ id }));

  const latestOperation = useSelector((s: AppState) =>
    selectLatestSuccessDeployOpByEnvId(s, { envId: id }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvironmentId(s, { envId: environment.id }),
  );
  const crumbs = [{ name: stack.name, to: stackDetailEnvsUrl(id) }];

  const tabs: TabItem[] = [
    { name: "Apps", href: `/environments/${id}/apps` },
    { name: "Databases", href: `/environments/${id}/databases` },
    { name: "Integrations", href: `/environments/${id}/integrations` },
    { name: "Certificates", href: `/environments/${id}/certificates` },
    { name: "Activity", href: `/environments/${id}/activity` },
    { name: "Backups", href: `/environments/${id}/backups` },
    { name: "Settings", href: `/environments/${id}/settings` },
  ];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      detailsBox={
        <EnvHeader
          endpoints={endpoints}
          environment={environment}
          latestOperation={latestOperation}
          stack={stack}
        />
      }
      title={environment.handle}
      tabs={tabs}
    />
  );
}

export const EnvironmentDetailLayout = () => {
  return (
    <>
      <MenuWrappedPage header={<EnvironmentPageHeader />}>
        <Outlet />
      </MenuWrappedPage>
    </>
  );
};
