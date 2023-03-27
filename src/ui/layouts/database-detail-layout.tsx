import { Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import type { AppState, DeployDatabase } from "@app/types";
import { selectDatabaseById } from "@app/deploy";
import {
  databaseActivityUrl,
  databaseBackupsUrl,
  databaseOverviewUrl,
  databaseSecurityUrl,
  databaseSettingsUrl,
  databaseUrl,
} from "@app/routes";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconExternalLink,
  TabItem,
} from "../shared";

import { DetailPageLayout } from "./detail-page";
import { prettyEnglishDate } from "@app/date";

const crumbs = [{ name: "Databases", to: databaseUrl() }];

const databaseDetailBox = ({
  database,
}: { database: DeployDatabase }): React.ReactElement => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full py-6 -mt-5 -mb-5">
    <Box>
      <Button className="flex ml-auto" variant="white">
        View Docs
        <IconExternalLink className="inline ml-3 h-5 mt-0" />
      </Button>
      <h1 className="text-md text-gray-500 -mt-10">Database Details</h1>
      <div className="flex w-1/1">
        <div className="flex-col w-1/3">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Type</h3>
            <p>{database.type}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Disk Size</h3>
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
            <h3 className="text-base font-semibold text-gray-900">Disk IOPS</h3>
            <p>{database.disk?.provisionedIops}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Disk Type</h3>
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
            <p>
              {
                // TODO - what is the source of this data?
              }
              0.5 GB
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">CPU Share</h3>
            <p>
              {
                // TODO - what is the source of this data?
              }
              0.125
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Profile</h3>
            <p>
              {
                // TODO - what is the source of this data?
              }
              General Purpose (M)
            </p>
          </div>
        </div>
      </div>
    </Box>
  </div>
);

function DatabasePageHeader() {
  const { id = "" } = useParams();
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  const tabs = [
    { name: "Overview", href: databaseOverviewUrl(id) },
    { name: "Activity", href: databaseActivityUrl(id) },
    { name: "Security", href: databaseSecurityUrl(id) },
    { name: "Backups", href: databaseBackupsUrl(id) },
    { name: "Settings", href: databaseSettingsUrl(id) },
  ] as TabItem[];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={database ? database.handle : "Loading..."}
      detailsBox={databaseDetailBox({ database })}
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
