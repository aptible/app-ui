import {
  sourceDetailAppsUrl,
  sourceDetailSettingsUrl,
  sourcesUrl,
} from "@app/routes";
import { fetchSourceById, selectSourceById } from "@app/source";
import { AppState, DeploySource } from "@app/types";
import { Outlet, useParams } from "react-router";
import { useQuery, useSelector } from "starfx/react";
import {
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  ExternalLink,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function SourceHeader({ source }: { source: DeploySource }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Source Details"
        icon={
          <img
            src="/resource-types/logo-app.png"
            className="w-[32px] h-[32px] mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{source.id}</DetailInfoItem>
        <DetailInfoItem title="Git Browse URL">
          <ExternalLink href={source.gitBrowseUrl}>
            {source.gitBrowseUrl}
          </ExternalLink>
        </DetailInfoItem>
        <DetailInfoItem title="Name">
          <CopyText text={source.name} />
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function SourcePageHeader() {
  const { id = "" } = useParams();
  const loader = useQuery(fetchSourceById({ id }));
  const source = useSelector((s: AppState) => selectSourceById(s, { id }));

  const crumbs = [{ name: "Sources", to: sourcesUrl() }];

  const tabs: TabItem[] = [
    { name: "Apps", href: sourceDetailAppsUrl(id) },
    { name: "Settings", href: sourceDetailSettingsUrl(id) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={source.name}
      detailsBox={<SourceHeader source={source} />}
      tabs={tabs}
    />
  );
}

export function SourceDetailLayout() {
  return (
    <AppSidebarLayout header={<SourcePageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
}
