import { prettyDateTime } from "@app/date";
import { useQuery, useSelector } from "@app/react";
import {
  sourceDetailAppsUrl,
  sourceDetailDeploymentsUrl,
  sourcesUrl,
} from "@app/routes";
import { fetchSourceById, selectSourceById } from "@app/source";
import { DeploySource } from "@app/types";
import { Outlet, useParams } from "react-router";
import {
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  OptionalExternalLink,
  SourceLogo,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function SourceHeader({ source }: { source: DeploySource }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Source Details"
        icon={<SourceLogo source={source} className="w-[32px] h-[32px] mr-3" />}
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{source.id}</DetailInfoItem>
        <DetailInfoItem title="Name">
          <CopyText text={source.displayName} />
        </DetailInfoItem>
        <DetailInfoItem title="Created">
          {prettyDateTime(source.createdAt)}
        </DetailInfoItem>
        <DetailInfoItem title="Repository URL">
          <OptionalExternalLink
            href={source.url}
            linkIf={!!source.url?.match(/^https?:\/\//)}
          >
            <CopyText text={source.url} />
          </OptionalExternalLink>
        </DetailInfoItem>
        <DetailInfoItem title="Last Deployed">
          {prettyDateTime(source.createdAt)}
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
