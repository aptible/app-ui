import { prettyEnglishDate } from "@app/date";
import {
  cancelAppOpsPoll,
  fetchApp,
  fetchImageById,
  fetchServicesByAppId,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
  selectImageById,
  selectLatestDeployOp,
  selectServiceById,
} from "@app/deploy";
import {
  appActivityUrl,
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
import { SyntheticEvent, useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";
import { usePoller } from "../hooks";
import {
  ActiveOperationNotice,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconCopy,
  TabItem,
  Tooltip,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function AppHeader({ app }: { app: DeployApp }) {
  const handleCopy = (e: SyntheticEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };
  const lastDeployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s: AppState) =>
    selectImageById(s, { id: app.currentImageId }),
  );

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
        <DetailInfoItem title="ID">
          <div className="flex flex-row items-center">
            {app.id}
            <Tooltip text="Copy">
              <IconCopy
                variant="sm"
                className="ml-2"
                color="#888C90"
                onClick={(e) => handleCopy(e, `${app.id}`)}
              />
            </Tooltip>
          </div>
        </DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Git Remote">{app.gitRepo}</DetailInfoItem>
        </div>
        <DetailInfoItem title="Last Deployed">
          {lastDeployOp
            ? `${prettyEnglishDate(lastDeployOp.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Docker Image">
            {image.dockerRepo}
          </DetailInfoItem>
        </div>
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
