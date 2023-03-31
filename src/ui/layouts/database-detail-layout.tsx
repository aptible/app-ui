import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import {
  CONTAINER_PROFILES,
  calcMetrics,
  selectDatabaseById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import {
  databaseActivityUrl,
  databaseBackupsUrl,
  databaseClusterUrl,
  databaseEndpointsUrl,
  databaseScaleUrl,
  databaseSettingsUrl,
  environmentResourcelUrl,
} from "@app/routes";
import type { AppState, DeployDatabase, DeployService } from "@app/types";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconExternalLink,
  TabItem,
} from "../shared";

import { DetailPageLayout } from "./detail-page";

const databaseDetailBox = ({
  database,
  service,
}: {
  database: DeployDatabase;
  service: DeployService;
}): React.ReactElement => {
  const metrics = calcMetrics([service]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full py-6 -mt-5 -mb-5">
      <Box>
        <div className="flex flex-row-reverse">
          <Button className="ml-5" variant="white">
            View Docs
            <IconExternalLink className="inline ml-3 h-5 mt-0" />
          </Button>
          <Button className="ml-5" variant="white">
            View Credentials
          </Button>
        </div>
        <h1 className="text-md text-gray-500 -mt-5">Database Details</h1>
        <div className="flex w-1/1">
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Type</h3>
              <p>{database.type}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Disk Size
              </h3>
              <p>{database.disk?.size || 0} GB</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Container Size
              </h3>
              <p>
                {
                  // TODO - need to update container on API side (memory)
                }
                N/A
              </p>
            </div>
          </div>
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Disk IOPS
              </h3>
              <p>{database.disk?.provisionedIops}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Disk Type
              </h3>
              <p>{database.disk?.ebsVolumeType}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Disk Encryption
              </h3>
              <p>
                {
                  // TODO - what is the source of this data?
                }
                AES-256
              </p>
            </div>
          </div>
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Memory Limit
              </h3>
              <p>{metrics.totalMemoryLimit / 1024} GB</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                CPU Share
              </h3>
              <p>{metrics.totalCPU}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Profile</h3>
              <p>{CONTAINER_PROFILES[service.instanceClass].name}</p>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

function DatabasePageHeader() {
  const { id = "" } = useParams();
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const crumbs = [
    { name: environment.handle, to: environmentResourcelUrl(environment.id) },
  ];

  const tabs = [
    { name: "Endpoints", href: databaseEndpointsUrl(id) },
    { name: "Scale", href: databaseScaleUrl(id) },
    { name: "Activity", href: databaseActivityUrl(id) },
    { name: "Backups", href: databaseBackupsUrl(id) },
    { name: "Cluster", href: databaseClusterUrl(id) },
    { name: "Settings", href: databaseSettingsUrl(id) },
  ] as TabItem[];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={database ? database.handle : "Loading..."}
      detailsBox={databaseDetailBox({ database, service })}
      tabs={tabs}
    />
  );
}

export const DatabaseDetailLayout = () => {
  return (
    <DetailPageLayout header={<DatabasePageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
