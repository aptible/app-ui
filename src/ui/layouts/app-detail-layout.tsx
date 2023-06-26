import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { prettyEnglishDate } from "@app/date";
import {
  cancelAppOpsPoll,
  fetchApp,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
} from "@app/deploy";
import {
  appActivityUrl,
  appEndpointsUrl,
  appServicesUrl,
  appSettingsUrl,
  environmentAppsUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployApp } from "@app/types";

import { usePoller } from "../hooks";
import { useInterval } from "../hooks/use-interval";
import {
  ActiveOperationNotice,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";

import { MenuWrappedPage } from "./menu-wrapped-page";
import { useQuery } from "saga-query/react";

export function AppHeader({ app }: { app: DeployApp }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="App Details"
        icon={
          <img
            src={"/resource-types/logo-app.png"}
            className="w-8 h-8 mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="Git Remote">{app.gitRepo}</DetailInfoItem>
        <DetailInfoItem title="Last Deployed">
          {app.lastDeployOperation
            ? `${capitalize(
                app.lastDeployOperation.type,
              )} on ${prettyEnglishDate(app.lastDeployOperation?.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
        <div />

        <DetailInfoItem title="Docker Image">
          {app.currentImage?.dockerRepo}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function AppPageHeader() {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const [_, setHeartbeat] = useState<Date>(new Date());
  const crumbs = [
    { name: environment.handle, to: environmentAppsUrl(environment.id) },
  ];

  const poller = useMemo(() => pollAppOperations({ id }), [id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);
  useInterval(() => setHeartbeat(new Date()), 1000);
  usePoller({
    action: poller,
    cancel,
  });

  // TODO - COME BACK TO THIS
  // Need to kick a user back out of the details page (or lock specific pages if it is deleted)
  // currently the network log will error with a 404 (as the record will be deleted)

  const tabs: TabItem[] = [
    { name: "Services", href: appServicesUrl(id) },
    { name: "Endpoints", href: appEndpointsUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Settings", href: appSettingsUrl(id) },
  ];

  return (
    <>
      <ActiveOperationNotice resourceId={app.id} resourceType="app" />
      <DetailPageHeaderView
        breadcrumbs={crumbs}
        title={app.handle}
        detailsBox={<AppHeader app={app} />}
        tabs={tabs}
      />
    </>
  );
}

export const AppDetailLayout = () => {
  return (
    <MenuWrappedPage header={<AppPageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};
