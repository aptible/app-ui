import { useQuery, useSelector } from "@app/react";
import {
  sourceDetailAppsUrl,
  sourceDetailDeploymentsUrl,
  sourceDetailSettingsUrl,
  sourcesUrl,
} from "@app/routes";
import { fetchSourceById, selectSourceById } from "@app/source";
import { DeploySource } from "@app/types";
import { Outlet, useParams } from "react-router";
import {
  Code,
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  ExternalLink,
  IconExternalLink,
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
        <DetailInfoItem title="Name">
          <CopyText text={source.displayName} />
        </DetailInfoItem>
        <DetailInfoItem title="Source Ref">
          <Code>{source.dockerUrl || source.gitUrl}</Code>
        </DetailInfoItem>
        <DetailInfoItem title="Git URL">
          <ExternalLink href={source.gitBrowseUrl}>
            {source.gitBrowseUrl}{" "}
            <IconExternalLink className="inline-block mb-1 mr-1" variant="sm" />
          </ExternalLink>
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function SourcePageHeader() {
  const { id = "" } = useParams();
  const loader = useQuery(fetchSourceById({ id }));
  const source = useSelector((s) => selectSourceById(s, { id }));

  const crumbs = [{ name: "Sources", to: sourcesUrl() }];

  const tabs: TabItem[] = [
    { name: "Apps", href: sourceDetailAppsUrl(id) },
    { name: "Deployments", href: sourceDetailDeploymentsUrl(id) },
    { name: "Settings", href: sourceDetailSettingsUrl(id) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={source.displayName}
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
