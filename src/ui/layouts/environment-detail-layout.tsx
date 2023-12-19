import { timeAgo } from "@app/date";
import {
  fetchApps,
  fetchEndpointsByEnvironmentId,
  fetchEnvironmentById,
  fetchEnvironmentOperations,
  selectEndpointsByEnvironmentId,
  selectEnvironmentById,
  selectEnvironmentStatsById,
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
  DeployEnvironmentStats,
  DeployOperation,
  DeployStack,
} from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams, useSearchParams } from "react-router-dom";

import { setResourceStats } from "@app/search";
import { useEffect } from "react";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

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
  stack,
  endpoints,
  stats,
}: {
  environment: DeployEnvironment;
  stats: DeployEnvironmentStats;
  stack: DeployStack;
  endpoints: DeployEndpoint[];
}) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Environment Details"
        icon={
          <img
            src={"/resource-types/logo-environment.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="Environment"
          />
        }
        docsUrl="https://www.aptible.com/docs/environments"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{environment.id}</DetailInfoItem>
        <DetailInfoItem title={`${environment.totalDatabaseCount} Databases`}>
          {stats.databaseContainerCount} containers using {stats.totalDiskSize}{" "}
          GB of disk
        </DetailInfoItem>
        <DetailInfoItem title="Stack">{stack.name}</DetailInfoItem>

        <DetailInfoItem title="Backups">
          {stats.totalBackupSize} GB
        </DetailInfoItem>
        <DetailInfoItem title={`${environment.totalAppCount} Apps`}>
          Using {stats.appContainerCount} containers
        </DetailInfoItem>

        <DetailInfoItem title={`${stats.domainCount} Endpoints`}>
          {endpoints.length <= 5
            ? endpoints.map((endpoint) => (
                <EndpointList key={endpoint.id} endpoint={endpoint} />
              ))
            : null}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function EnvironmentPageHeader({ id }: { id: string }): React.ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "environment" }));
  }, []);

  const loader = useQuery(fetchEnvironmentById({ id }));
  useQuery(fetchApps());
  useQuery(fetchEndpointsByEnvironmentId({ id }));
  useQuery(fetchEnvironmentOperations({ id }));

  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );
  const stats = useSelector((s: AppState) =>
    selectEnvironmentStatsById(s, { id: environment.id }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvironmentId(s, { envId: environment.id }),
  );
  const crumbs = [{ name: stack.name, to: stackDetailEnvsUrl(stack.id) }];

  const tabs: TabItem[] = [
    { name: "Apps", href: `/environments/${id}/apps` },
    { name: "Databases", href: `/environments/${id}/databases` },
    { name: "Integrations", href: `/environments/${id}/integrations` },
    { name: "Endpoints", href: `/environments/${id}/endpoints` },
    { name: "Certificates", href: `/environments/${id}/certificates` },
    { name: "Activity", href: `/environments/${id}/activity` },
    { name: "Activity Reports", href: `/environments/${id}/activity_reports` },
    { name: "Backups", href: `/environments/${id}/backups` },
    { name: "Settings", href: `/environments/${id}/settings` },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      detailsBox={
        <EnvHeader
          endpoints={endpoints}
          environment={environment}
          stack={stack}
          stats={stats}
        />
      }
      title={environment.handle}
      tabs={tabs}
    />
  );
}

export const EnvironmentDetailLayout = ({
  children,
}: { children?: React.ReactNode }) => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const envId = id || params.get("environment_id") || "";
  return (
    <AppSidebarLayout header={<EnvironmentPageHeader id={envId} />}>
      {children ? children : <Outlet />}
    </AppSidebarLayout>
  );
};
