import { prettyDateTime } from "@app/date";
import {
  cancelAppOpsPoll,
  fetchApp,
  fetchConfiguration,
  fetchImageById,
  fetchServicesByAppId,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
  selectImageById,
  selectLatestDeployOp,
  selectUserHasPerms,
} from "@app/deploy";
import { fetchDeploymentById, selectDeploymentById } from "@app/deployment";
import { findLoaderComposite } from "@app/loaders";
import { selectHasBetaFeatures } from "@app/organizations";
import { useDispatch, useQuery, useSelector } from "@app/react";
import {
  appActivityUrl,
  appCiCdUrl,
  appConfigUrl,
  appDetailDeploymentsUrl,
  appDetailDepsUrl,
  appDetailUrl,
  appEndpointsUrl,
  appServicesUrl,
  appSettingsUrl,
  environmentAppsUrl,
  sourceDetailUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import { fetchSourceById, selectSourceById } from "@app/source";
import type { DeployApp } from "@app/types";
import { useEffect, useMemo } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { usePoller } from "../hooks";
import {
  ActiveOperationNotice,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  DockerImage,
  GitCommitMessage,
  GitRef,
  SourceName,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function AppHeader({
  app,
  isLoading,
}: { app: DeployApp; isLoading: boolean }) {
  const lastDeployOp = useSelector((s) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  const hasBetaFeatures = useSelector(selectHasBetaFeatures);

  useQuery(fetchDeploymentById({ id: app.currentDeploymentId }));
  const deployment = useSelector((s) =>
    selectDeploymentById(s, { id: app.currentDeploymentId }),
  );

  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );

  useQuery(fetchSourceById({ id: app.currentSourceId }));
  const source = useSelector((s) =>
    selectSourceById(s, { id: app.currentSourceId }),
  );

  return (
    <DetailHeader>
      <DetailTitleBar
        title="App Details"
        isLoading={isLoading}
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
        <DetailInfoItem title="Git Ref">
          <GitRef
            gitRef={deployment.gitRef}
            commitSha={deployment.gitCommitSha}
            commitUrl={deployment.gitCommitUrl}
          />
        </DetailInfoItem>

        <DetailInfoItem title="Source">
          {hasBetaFeatures && source.id ? (
            <Link to={sourceDetailUrl(source.id)}>{source.displayName}</Link>
          ) : (
            <SourceName app={app} deployment={deployment} />
          )}
        </DetailInfoItem>
        <DetailInfoItem title="Commit Message">
          <div className="max-h-[21px]">
            <GitCommitMessage message={deployment.gitCommitMessage} />
          </div>
        </DetailInfoItem>

        <DetailInfoItem title="Created">
          {prettyDateTime(app.createdAt)}
        </DetailInfoItem>
        <DetailInfoItem title="Docker Image">
          <DockerImage
            image={deployment.dockerImage}
            digest={image.dockerRef}
            repoUrl={deployment.dockerRepositoryUrl}
          />
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

  const loaderApp = useQuery(fetchApp({ id }));
  const loaderServices = useQuery(fetchServicesByAppId({ id: id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  const loaderConfig = useQuery(
    fetchConfiguration({ id: app.currentConfigurationId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const loader = findLoaderComposite([loaderApp, loaderServices, loaderConfig]);

  const crumbs = [
    { name: environment.handle, to: environmentAppsUrl(environment.id) },
  ];
  const hasConfigAccess = useSelector((s) =>
    selectUserHasPerms(s, { envId: app.environmentId, scope: "read" }),
  );
  const hasBetaFeatures = useSelector(selectHasBetaFeatures);

  const tabs: TabItem[] = [{ name: "Services", href: appServicesUrl(id) }];

  if (hasBetaFeatures) {
    tabs.push({ name: "Deployments", href: appDetailDeploymentsUrl(id) });
  }

  tabs.push(
    { name: "Endpoints", href: appEndpointsUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Configuration", href: appConfigUrl(id) },
  );

  if (hasConfigAccess) {
    tabs.push({ name: "Dependencies", href: appDetailDepsUrl(id) });
  }

  tabs.push(
    { name: "CI/CD", href: appCiCdUrl(id) },
    { name: "Settings", href: appSettingsUrl(id) },
  );

  return (
    <>
      <AppHeartbeatNotice id={id} />
      <DetailPageHeaderView
        {...loader}
        breadcrumbs={crumbs}
        title={app.handle}
        detailsBox={<AppHeader app={app} isLoading={loader.isLoading} />}
        tabs={tabs}
        lastBreadcrumbTo={appDetailUrl(app.id)}
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
