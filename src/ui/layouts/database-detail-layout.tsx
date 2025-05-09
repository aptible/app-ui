import { prettyDateTime } from "@app/date";
import {
  fetchBackupRp,
  fetchBackupsByDatabaseId,
  fetchDatabaseImageById,
  fetchDatabaseImages,
  fetchEndpointsByServiceId,
  fetchRelease,
  selectLatestBackupRpByEnvId,
} from "@app/deploy";
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
  databasePitrUrl,
  databaseScaleUrl,
  databaseSettingsUrl,
  environmentDatabasesUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type { DeployDatabase, DeployService } from "@app/types";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import { usePoller } from "../hooks";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  ScaleRecsView,
  type TabItem,
} from "../shared";
import { ActiveOperationNotice } from "../shared/active-operation-notice";
import { DatabaseEolNotice } from "../shared/db/database-eol-notice";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function DatabaseHeader({
  database,
  databasePrimary,
  service,
  isLoading,
}: {
  database: DeployDatabase;
  databasePrimary: DeployDatabase;
  service: DeployService;
  isLoading: boolean;
}) {
  // Query additional data that subpages need
  useQuery(fetchEndpointsByServiceId({ id: database.serviceId }));
  useQuery(fetchBackupsByDatabaseId({ id: database.id }));
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchBackupRp({ envId: database.environmentId }));

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
        {databasePrimary.id && (
          <DetailInfoItem title="Replicates">
            <Link to={databaseDetailUrl(databasePrimary.id)} className="flex">
              {databasePrimary.handle}
            </Link>
          </DetailInfoItem>
        )}
        <DetailInfoItem title="Scaling Recommendations">
          <ScaleRecsView service={service} />
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
  const databasePrimary = useSelector((s) =>
    selectDatabaseById(s, { id: database.initializeFrom }),
  );
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const image = useSelector((s) =>
    selectDatabaseImageById(s, { id: database.databaseImageId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const backupPolicy = useSelector((s) =>
    selectLatestBackupRpByEnvId(s, { envId: database.environmentId }),
  );
  const loaderDb = useQuery(fetchDatabase({ id }));
  const loaderService = useQuery(fetchService({ id: database.serviceId }));
  const loader = findLoaderComposite([loaderDb, loaderService]);
  useQuery(fetchDatabaseImageById({ id: database.databaseImageId }));

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
  ] as TabItem[];

  // TODO: Create database pitr enabled helper
  if (
    backupPolicy.pitrDays > 0 &&
    database.enableBackups &&
    image.pitrSupported
  ) {
    tabs.push({ name: "Recovery", href: databasePitrUrl(id) });
  }

  tabs.push({ name: "Settings", href: databaseSettingsUrl(id) });

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
            databasePrimary={databasePrimary}
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
