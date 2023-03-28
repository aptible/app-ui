import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { environmentsUrl } from "@app/routes";

import { DetailPageHeaderView, TabItem } from "../shared";

import { DetailPageLayout } from "./detail-page";
import { selectEnvironmentById } from "@app/deploy";
import { AppState } from "@app/types";

const crumbs = [{ name: "Environments", to: environmentsUrl() }];

function EnvironmentPageHeader() {
  const { id = "" } = useParams();
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );

  const tabs = [
    { name: "Resources", href: `/environments/${id}/resources` },
    { name: "Integrations", href: `/environments/${id}/integrations` },
    { name: "Certificates", href: `/environments/${id}/certificates` },
    { name: "Activity", href: `/environments/${id}/activity` },
    { name: "Backups", href: `/environments/${id}/backups` },
    { name: "Settings", href: `/environments/${id}/settings` },
  ] as TabItem[];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={environment ? environment.handle : "Loading..."}
      tabs={tabs}
    />
  );
}

export const EnvironmentDetailLayout = () => {
  return (
    <DetailPageLayout header={<EnvironmentPageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
