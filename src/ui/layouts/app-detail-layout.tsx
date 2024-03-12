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
import { getTagText } from "@app/deployment";
import { findLoaderComposite } from "@app/loaders";
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
} from "@app/routes";
import { schema } from "@app/schema";
import { setResourceStats } from "@app/search";
import { prettyGitSha } from "@app/string-utils";
import type { DeployApp } from "@app/types";
import { useEffect, useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
import { usePoller } from "../hooks";
import {
  ActiveOperationNotice,
  Code,
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  GitMetadata,
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
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const config = useSelector((s) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const deployment = useSelector((s) =>
    schema.deployments.selectById(s, { id: app.currentDeploymentId }),
  );
  const gitRef = deployment.gitCommitSha || image.gitRef;
  const dockerImage =
    deployment.dockerImage ||
    config.env.APTIBLE_DOCKER_IMAGE ||
    "Dockerfile Build";

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
          <CopyText text={gitRef}>
            <Code>{prettyGitSha(gitRef)}</Code>
          </CopyText>
        </DetailInfoItem>

        {deployment.id ? (
          <>
            <DetailInfoItem title="Source">
              <SourceName app={app} deployment={deployment} />
            </DetailInfoItem>
            {deployment.gitCommitMessage ? (
              <DetailInfoItem title="Git">
                <GitMetadata deployment={deployment} />
              </DetailInfoItem>
            ) : null}
            <DetailInfoItem title="Tag">
              <Code>{getTagText(deployment)}</Code>
            </DetailInfoItem>
          </>
        ) : null}

        <DetailInfoItem title="Last Deployed">
          {lastDeployOp
            ? `${prettyDateTime(lastDeployOp.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
        <DetailInfoItem title="Docker Image">
          <CopyText text={`${dockerImage}`} />
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

  const tabs: TabItem[] = [
    { name: "Services", href: appServicesUrl(id) },
    { name: "Deployments", href: appDetailDeploymentsUrl(id) },
    { name: "Endpoints", href: appEndpointsUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Configuration", href: appConfigUrl(id) },
  ];

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
