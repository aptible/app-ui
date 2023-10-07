import {
  cancelFetchEndpointPoll,
  fetchApp,
  fetchDatabase,
  fetchImageById,
  fetchService,
  getContainerPort,
  getEndpointText,
  getEndpointUrl,
  pollFetchEndpoint,
  requiresAcmeSetup,
  selectAppById,
  selectDatabaseById,
  selectEndpointById,
  selectImageById,
  selectServiceById,
} from "@app/deploy";
import {
  appEndpointsUrl,
  databaseEndpointsUrl,
  endpointDetailActivityUrl,
  endpointDetailSettingsUrl,
  endpointDetailSetupUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployEndpoint,
  DeployService,
} from "@app/types";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import { useLoader, useQuery } from "saga-query/react";
import { usePoller } from "../hooks";
import {
  Banner,
  Code,
  CopyText,
  CopyTextButton,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  EndpointStatusPill,
  EndpointUrl,
  Loading,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function EndpointAppHeaderInfo({
  enp,
  app,
  service,
}: { enp: DeployEndpoint; app: DeployApp; service: DeployService }) {
  const txt = getEndpointText(enp);
  const image = useSelector((s: AppState) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const portTxt = getContainerPort(enp, image.exposedPorts);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Endpoint Details"
        icon={
          <img
            src={"/resource-types/logo-vhost.png"}
            className="w-8 h-8 mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/endpoints"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="URL">
          <div className="flex flex-row items-center gap-2">
            <EndpointUrl enp={enp} />
            <CopyTextButton text={getEndpointUrl(enp)} />
          </div>
        </DetailInfoItem>
        <DetailInfoItem title="Hostname">
          <CopyText text={enp.externalHost} />
        </DetailInfoItem>

        <DetailInfoItem title="Resource">
          <Link to={appEndpointsUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Service Process">
          <Code>{service.processType}</Code>
        </DetailInfoItem>
        <DetailInfoItem title="Service ID">
          <CopyText text={service.id} />
        </DetailInfoItem>
        <DetailInfoItem title="IP Allowlist">{txt.ipAllowlist}</DetailInfoItem>
        <DetailInfoItem title="Placement">{txt.placement}</DetailInfoItem>
        <DetailInfoItem title="Port">{portTxt}</DetailInfoItem>
        <DetailInfoItem title="Status">
          <EndpointStatusPill status={enp.status} />
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

export function EndpointDatabaseHeaderInfo({
  enp,
  db,
}: { enp: DeployEndpoint; db: DeployDatabase }) {
  const txt = getEndpointText(enp);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Endpoint Details"
        icon={
          <img
            src={"/resource-types/logo-vhost.png"}
            className="w-8 h-8 mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/endpoints"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="URL">
          <div className="flex flex-row items-center gap-2">
            <EndpointUrl enp={enp} />
            <CopyTextButton text={getEndpointUrl(enp)} />
          </div>
        </DetailInfoItem>
        <DetailInfoItem title="Resource">
          <Link to={databaseEndpointsUrl(db.id)}>{db.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Status">
          <EndpointStatusPill status={enp.status} />
        </DetailInfoItem>
        <DetailInfoItem title="IP Allowlist">{txt.ipAllowlist}</DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function EndpointAppHeader({
  enp,
  service,
  isError,
  message,
  meta,
}: {
  enp: DeployEndpoint;
  service: DeployService;
  isError: boolean;
  message: string;
  meta: Record<string, any>;
}) {
  useQuery(fetchApp({ id: service.appId }));
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: service.appId }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const url = appEndpointsUrl(app.id);
  const tabs: TabItem[] = [
    { name: "Activity", href: endpointDetailActivityUrl(enp.id) },
    { name: "Settings", href: endpointDetailSettingsUrl(enp.id) },
  ];
  if (enp.acme) {
    tabs.push({ name: "ACME Configure", href: endpointDetailSetupUrl(enp.id) });
  }

  return (
    <>
      {requiresAcmeSetup(enp) ? (
        <Banner variant="warning" className="mb-4">
          Further steps required to setup custom domain!{" "}
          <Link
            to={endpointDetailSetupUrl(enp.id)}
            className="text-white underline"
          >
            Finish setup
          </Link>
        </Banner>
      ) : null}
      <DetailPageHeaderView
        isError={isError}
        message={message}
        meta={meta}
        tabs={tabs}
        breadcrumbs={[{ name: app.handle, to: url }]}
        title={`Endpoint: ${enp.id}`}
        detailsBox={
          <EndpointAppHeaderInfo enp={enp} app={app} service={service} />
        }
      />
    </>
  );
}

function EndpointDatabaseHeader({
  enp,
  service,
  isError,
  message,
  meta,
}: {
  enp: DeployEndpoint;
  service: DeployService;
  isError: boolean;
  message: string;
  meta: Record<string, any>;
}) {
  useQuery(fetchDatabase({ id: service.databaseId }));
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: service.databaseId }),
  );
  const url = databaseEndpointsUrl(db.id);
  const tabs: TabItem[] = [
    { name: "Activity", href: endpointDetailActivityUrl(enp.id) },
    { name: "Settings", href: endpointDetailSettingsUrl(enp.id) },
  ];

  return (
    <DetailPageHeaderView
      isError={isError}
      message={message}
      meta={meta}
      tabs={tabs}
      breadcrumbs={[{ name: db.handle, to: url }]}
      title={`Endpoint: ${enp.id}`}
      detailsBox={<EndpointDatabaseHeaderInfo enp={enp} db={db} />}
    />
  );
}

function EndpointPageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const action = useMemo(() => pollFetchEndpoint({ id }), [id]);
  const cancel = useMemo(() => cancelFetchEndpointPoll(), []);
  const loader = useLoader(action);
  usePoller({ action, cancel });
  const enp = useSelector((s: AppState) => selectEndpointById(s, { id }));
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "endpoint" }));
  }, []);
  useQuery(fetchService({ id: enp.serviceId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: enp.serviceId }),
  );

  if (service.appId) {
    return <EndpointAppHeader {...loader} enp={enp} service={service} />;
  }

  if (service.databaseId) {
    return <EndpointDatabaseHeader {...loader} enp={enp} service={service} />;
  }

  return <Loading text="Loading endpoint information..." />;
}

export const EndpointDetailLayout = () => {
  return (
    <AppSidebarLayout header={<EndpointPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
