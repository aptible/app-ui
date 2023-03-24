import { Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import type { AppState } from "@app/types";
import { selectDatabaseById } from "@app/deploy";
import {
  databaseActivityUrl,
  databaseBackupsUrl,
  databaseOverviewUrl,
  databaseSecurityUrl,
  databaseSettingsUrl,
  databaseUrl,
} from "@app/routes";

import { DetailPageHeaderView, TabItem } from "../shared";

import { DetailPageLayout } from "./detail-page";

const crumbs = [{ name: "Databases", to: databaseUrl() }];

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
