import {
  fetchApps,
  fetchEndpointsByEnvironmentId,
  fetchEnvironmentById,
  fetchEnvironmentOperations,
  selectEndpointsByEnvironmentId,
  selectEnvironmentById,
  selectEnvironmentStatsById,
  selectStackById,
} from "@app/deploy";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { environmentDetailUrl, stackDetailEnvsUrl } from "@app/routes";
import {
  DeployEndpoint,
  DeployEnvironment,
  DeployEnvironmentStats,
  DeployStack,
} from "@app/types";
import { Outlet, useParams, useSearchParams } from "react-router-dom";

import { findLoaderComposite } from "@app/loaders";
import { setResourceStats } from "@app/search";
import { useEffect, useMemo } from "react";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  EndpointUrl,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function EnvHeader({
  environment,
  stack,
  endpoints,
  stats,
  isLoading,
}: {
  environment: DeployEnvironment;
  stats: DeployEnvironmentStats;
  stack: DeployStack;
  endpoints: DeployEndpoint[];
  isLoading: boolean;
}) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Environment Details"
        isLoading={isLoading}
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
                <EndpointUrl key={endpoint.id} enp={endpoint} />
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

  const loaderEnv = useQuery(fetchEnvironmentById({ id }));
  const loaderApps = useQuery(fetchApps());
  const loaderEndpoints = useQuery(fetchEndpointsByEnvironmentId({ id }));
  useQuery(fetchEnvironmentOperations({ id }));
  const loader = useMemo(
    () => findLoaderComposite([loaderEnv, loaderApps, loaderEndpoints]),
    [loaderEnv, loaderApps, loaderEndpoints],
  );

  const environment = useSelector((s) => selectEnvironmentById(s, { id }));
  const stats = useSelector((s) =>
    selectEnvironmentStatsById(s, { id: environment.id }),
  );
  const stack = useSelector((s) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const endpoints = useSelector((s) =>
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
          isLoading={loader.isLoading}
          endpoints={endpoints}
          environment={environment}
          stack={stack}
          stats={stats}
        />
      }
      title={environment.handle}
      tabs={tabs}
      lastBreadcrumbTo={environmentDetailUrl(environment.id)}
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
