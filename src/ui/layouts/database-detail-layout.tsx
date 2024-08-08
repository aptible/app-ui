import { prettyDateTime } from "@app/date";
import { fetchDatabaseImages } from "@app/deploy";
import {
  calcMetrics,
  cancelDatabaseOpsPoll,
  fetchDatabase,
  fetchDiskById,
  fetchService,
  pollDatabaseOperations,
  selectDatabaseById,
  selectDatabaseImageById,
  selectDiskById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import { CONTAINER_PROFILES } from "@app/deploy/container/utils";
import { findLoaderComposite } from "@app/loaders";
import { useDispatch, useQuery, useSelector } from "@app/react";
import {
  databaseActivityUrl,
  databaseBackupsUrl,
  databaseClusterUrl,
  databaseCredentialsUrl,
  databaseDetailUrl,
  databaseEndpointsUrl,
  databaseMetricsUrl,
  databaseScaleUrl,
  databaseSettingsUrl,
  environmentDatabasesUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type { DeployDatabase, DeployService } from "@app/types";
import { useEffect, useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
import { usePoller } from "../hooks";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  type TabItem,
} from "../shared";
import { ActiveOperationNotice } from "../shared/active-operation-notice";
import { DatabaseEolNotice } from "../shared/db/database-eol-notice";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function DatabaseHeader({
  database,
  service,
  isLoading,
}: {
  database: DeployDatabase;
  service: DeployService;
  isLoading: boolean;
}) {
  const metrics = calcMetrics([service]);
  useQuery(fetchDiskById({ id: database.diskId }));
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  useQuery(fetchDatabaseImages());
  const image = useSelector((s) =>
    selectDatabaseImageById(s, { id: database.databaseImageId }),
  );
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Database Details"
        isLoading={isLoading}
        icon={
          <img
            src={`/database-types/logo-${database.type}.png`}
            className="w-[32px] h-[32px] mr-3"
            aria-label={`${database.type} Database`}
          />
        }
        docsUrl="https://www.aptible.com/docs/databases"
      />

      <DetailInfoGrid columns={3}>
        <DetailInfoItem title="ID">{database.id}</DetailInfoItem>
        <DetailInfoItem title="Disk IOPS">
          {disk.provisionedIops}
        </DetailInfoItem>
        <DetailInfoItem title="Memory Limit">
          {metrics.totalMemoryLimit / 1024} GB
        </DetailInfoItem>
        <DetailInfoItem title="Type">{image.description}</DetailInfoItem>
        <DetailInfoItem title="Disk Type">{disk.ebsVolumeType}</DetailInfoItem>
        <DetailInfoItem title="CPU Share">{metrics.totalCPU}</DetailInfoItem>
        <DetailInfoItem title="Disk Size">{disk.size} GB</DetailInfoItem>
        <DetailInfoItem title="Disk Encryption">
          AES-{disk.keyBytes * 8}
        </DetailInfoItem>
        <DetailInfoItem title="Profile">
          {CONTAINER_PROFILES[service.instanceClass].name}
        </DetailInfoItem>
        <DetailInfoItem title="Created">
          {prettyDateTime(database.createdAt)}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

const DatabaseOperationNotice = ({ id }: { id: string }) => {
  const poller = useMemo(() => pollDatabaseOperations({ id }), [id]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  return <ActiveOperationNotice resourceId={id} resourceType="database" />;
};

function DatabasePageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "database" }));
  }, []);

  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const loaderDb = useQuery(fetchDatabase({ id }));
  const loaderService = useQuery(fetchService({ id: database.serviceId }));
  const loader = findLoaderComposite([loaderDb, loaderService]);

  const crumbs = [
    { name: environment.handle, to: environmentDatabasesUrl(environment.id) },
  ];

  const tabs = [
    { name: "Metrics", href: databaseMetricsUrl(id) },
    { name: "Scale", href: databaseScaleUrl(id) },
    { name: "Endpoints", href: databaseEndpointsUrl(id) },
    { name: "Activity", href: databaseActivityUrl(id) },
    { name: "Backups", href: databaseBackupsUrl(id) },
    { name: "Cluster", href: databaseClusterUrl(id) },
    { name: "Connection URLs", href: databaseCredentialsUrl(id) },
    { name: "Settings", href: databaseSettingsUrl(id) },
  ] as TabItem[];

  return (
    <>
      <DatabaseOperationNotice id={id} />
      <DatabaseEolNotice database={database} />
      <DetailPageHeaderView
        {...loader}
        breadcrumbs={crumbs}
        title={database ? database.handle : "Loading..."}
        detailsBox={
          <DatabaseHeader
            database={database}
            service={service}
            isLoading={loader.isLoading}
          />
        }
        tabs={tabs}
        lastBreadcrumbTo={databaseDetailUrl(database.id)}
      />
    </>
  );
}

export const DatabaseDetailLayout = () => {
  return (
    <AppSidebarLayout header={<DatabasePageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
