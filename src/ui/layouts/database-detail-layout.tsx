import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import {
  CONTAINER_PROFILES,
  calcMetrics,
  cancelDatabaseOpsPoll,
  pollDatabaseOperations,
  selectDatabaseById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import {
  databaseActivityUrl,
  databaseBackupsUrl,
  databaseClusterUrl,
  databaseEndpointsUrl,
  databaseMetricsUrl,
  databaseScaleUrl,
  databaseSettingsUrl,
  environmentDatabasesUrl,
} from "@app/routes";
import type { AppState, DeployDatabase, DeployService } from "@app/types";

import { usePoller } from "../hooks";
import { useInterval } from "../hooks/use-interval";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";
import { ActiveOperationNotice } from "../shared/active-operation-notice";

import { MenuWrappedPage } from "./menu-wrapped-page";
import { setResourceStats } from "@app/search";

export function DatabaseHeader({
  database,
  service,
}: {
  database: DeployDatabase;
  service: DeployService;
}) {
  const metrics = calcMetrics([service]);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Database Details"
        icon={
          <img
            src={`/database-types/logo-${database.type}.png`}
            className="w-8 h-8 mr-3"
            aria-label={`${database.type} Database`}
          />
        }
        docsUrl="https://www.aptible.com/docs/databases"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{database.id}</DetailInfoItem>
        <DetailInfoItem title="Disk IOPS">
          {database.disk?.provisionedIops}
        </DetailInfoItem>
        <DetailInfoItem title="Memory Limit">
          {metrics.totalMemoryLimit / 1024} GB
        </DetailInfoItem>

        <DetailInfoItem title="Type">{database.type}</DetailInfoItem>
        <DetailInfoItem title="Disk Type">
          {database.disk?.ebsVolumeType}
        </DetailInfoItem>
        <DetailInfoItem title="CPU Share">{metrics.totalCPU}</DetailInfoItem>

        <DetailInfoItem title="Disk Size">
          {database.disk?.size ? database.disk?.size : 0} GB
        </DetailInfoItem>
        <DetailInfoItem title="Disk Encryption">
          AES-{(database.disk?.keyBytes ? database.disk?.keyBytes : 32) * 8}
        </DetailInfoItem>
        <DetailInfoItem title="Profile">
          {CONTAINER_PROFILES[service.instanceClass].name}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function DatabasePageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "database" }));
  }, []);

  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const [_, setHeartbeat] = useState<Date>(new Date());
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const crumbs = [
    { name: environment.handle, to: environmentDatabasesUrl(environment.id) },
  ];

  const poller = useMemo(() => pollDatabaseOperations({ id }), [id]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  useInterval(() => setHeartbeat(new Date()), 1000);
  usePoller({
    action: poller,
    cancel,
  });

  const tabs = [
    { name: "Endpoints", href: databaseEndpointsUrl(id) },
    { name: "Metrics", href: databaseMetricsUrl(id) },
    { name: "Scale", href: databaseScaleUrl(id) },
    { name: "Activity", href: databaseActivityUrl(id) },
    { name: "Backups", href: databaseBackupsUrl(id) },
    { name: "Cluster", href: databaseClusterUrl(id) },
    { name: "Settings", href: databaseSettingsUrl(id) },
  ] as TabItem[];

  return (
    <>
      <ActiveOperationNotice resourceId={id} resourceType="database" />
      <DetailPageHeaderView
        breadcrumbs={crumbs}
        title={database ? database.handle : "Loading..."}
        detailsBox={<DatabaseHeader database={database} service={service} />}
        tabs={tabs}
      />
    </>
  );
}

export const DatabaseDetailLayout = () => {
  return (
    <MenuWrappedPage header={<DatabasePageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};
