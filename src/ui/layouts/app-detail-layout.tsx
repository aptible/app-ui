import { prettyEnglishDate } from "@app/date";
import {
  cancelAppOpsPoll,
  fetchApp,
  fetchConfiguration,
  fetchImageById,
  fetchServicesByAppId,
  pollAppOperations,
  selectAppById,
  selectAppConfigById,
  selectEnvironmentById,
  selectImageById,
  selectLatestDeployOp,
  selectServiceById,
} from "@app/deploy";
import {
  appActivityUrl,
  appConfigUrl,
  appEndpointsUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServicesUrl,
  appSettingsUrl,
  environmentAppsUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type { AppState, DeployApp } from "@app/types";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";
import { usePoller } from "../hooks";
import {
  ActiveOperationNotice,
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function AppHeader({ app }: { app: DeployApp }) {
  const lastDeployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s: AppState) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const config = useSelector((s: AppState) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const dockerImage = config.env.APTIBLE_DOCKER_IMAGE || "Dockerfile Build";

  return (
    <DetailHeader>
      <DetailTitleBar
        title="App Details"
        icon={
          <img
            src="/resource-types/logo-app.png"
            className="w-8 h-8 mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{app.id}</DetailInfoItem>
        <DetailInfoItem title="Git Remote">
          <CopyText text={app.gitRepo} />
        </DetailInfoItem>

        <DetailInfoItem title="Git Ref">
          <CopyText text={image.gitRef} />
        </DetailInfoItem>
        <DetailInfoItem title="Docker Image">
          <CopyText text={`${dockerImage}`} />
        </DetailInfoItem>

        <DetailInfoItem title="Last Deployed">
          {lastDeployOp
            ? `${prettyEnglishDate(lastDeployOp.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

const AppHeartbeatNotice = ({ id }: { id: string; serviceId: string }) => {
  const poller = useMemo(() => pollAppOperations({ id }), [id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);

  usePoller({
    action: poller,
    cancel,
  });

  return <ActiveOperationNotice resourceId={id} resourceType="app" />;
};

function AppPageHeader() {
  const { id = "", serviceId = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "app" }));
  }, []);

  const loader = useQuery(fetchApp({ id }));
  useQuery(fetchServicesByAppId({ id: id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );

  const crumbs = [
    { name: environment.handle, to: environmentAppsUrl(environment.id) },
  ];
  if (serviceId) {
    crumbs.push({
      name: app.handle,
      to: appServicesUrl(app.id),
    });
  }

  const tabs: TabItem[] = serviceId
    ? [
        { name: "Metrics", href: appServicePathMetricsUrl(id, serviceId) },
        { name: "Scale", href: appServiceScalePathUrl(id, serviceId) },
      ]
    : [
        { name: "Services", href: appServicesUrl(id) },
        { name: "Endpoints", href: appEndpointsUrl(id) },
        { name: "Activity", href: appActivityUrl(id) },
        { name: "Configuration", href: appConfigUrl(id) },
        { name: "Settings", href: appSettingsUrl(id) },
      ];

  return (
    <>
      <AppHeartbeatNotice id={id} serviceId={serviceId} />
      <DetailPageHeaderView
        {...loader}
        breadcrumbs={crumbs}
        title={serviceId ? service.processType : app.handle}
        detailsBox={<AppHeader app={app} />}
        tabs={tabs}
      />
    </>
  );
}

export const AppDetailLayout = () => {
  return (
    <AppSidebarLayout header={<AppPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
