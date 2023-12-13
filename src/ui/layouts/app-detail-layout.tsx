import { prettyDateTime } from "@app/date";
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
  selectUserHasPerms,
} from "@app/deploy";
import { useDispatch, useQuery, useSelector } from "@app/react";
import {
  appActivityUrl,
  appConfigUrl,
  appDetailDeploymentsUrl,
  appDetailDepsUrl,
  appEndpointsUrl,
  appServicesUrl,
  appSettingsUrl,
  environmentAppsUrl,
  // sourceDetailUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
// import { fetchSourceById, selectSourceById } from "@app/source";
import { fetchSourceById } from "@app/source";
import type { DeployApp } from "@app/types";
import { useEffect, useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
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
  const lastDeployOp = useSelector((s) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const config = useSelector((s) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const dockerImage = config.env.APTIBLE_DOCKER_IMAGE || "Dockerfile Build";
  useQuery(fetchSourceById({ id: app.sourceId }));
  /* const source = useSelector((s: AppState) =>
    selectSourceById(s, { id: app.sourceId }),
  ); */

  return (
    <DetailHeader>
      <DetailTitleBar
        title="App Details"
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
        <DetailInfoItem title="ID">{app.id}</DetailInfoItem>
        {/* app.sourceId ? (
          <DetailInfoItem title="Source">
            <Link to={sourceDetailUrl(source.id)}>{source.displayName}</Link>
          </DetailInfoItem>
        ) : null */}
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
            ? `${prettyDateTime(lastDeployOp.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

const AppHeartbeatNotice = ({ id }: { id: string }) => {
  const poller = useMemo(() => pollAppOperations({ id }), [id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);

  usePoller({
    action: poller,
    cancel,
  });

  return <ActiveOperationNotice resourceId={id} resourceType="app" />;
};

function AppPageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "app" }));
  }, []);

  const loader = useQuery(fetchApp({ id }));
  useQuery(fetchServicesByAppId({ id: id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const hasSensitivePerms = useSelector((s) =>
    selectUserHasPerms(s, { envId: app.environmentId, scope: "sensitive" }),
  );

  const crumbs = [
    { name: environment.handle, to: environmentAppsUrl(environment.id) },
  ];

  const tabs: TabItem[] = [
    { name: "Deployments", href: appDetailDeploymentsUrl(id) },
    { name: "Services", href: appServicesUrl(id) },
    { name: "Endpoints", href: appEndpointsUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Configuration", href: appConfigUrl(id) },
  ];

  if (hasSensitivePerms) {
    tabs.push({ name: "Dependencies", href: appDetailDepsUrl(id) });
  }

  tabs.push({ name: "Settings", href: appSettingsUrl(id) });

  return (
    <>
      <AppHeartbeatNotice id={id} />
      <DetailPageHeaderView
        {...loader}
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
    <AppSidebarLayout header={<AppPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
