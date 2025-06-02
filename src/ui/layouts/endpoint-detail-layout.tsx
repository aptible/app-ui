import {
  cancelFetchEndpointPoll,
  fetchApp,
  fetchDatabase,
  fetchImageById,
  fetchService,
  getContainerPort,
  getEndpointText,
  getEndpointUrl,
  isTlsOrTcp,
  pollFetchEndpoint,
  requiresAcmeSetup,
  selectAppById,
  selectDatabaseById,
  selectEndpointById,
  selectImageById,
  selectServiceById,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/react";
import { useDispatch, useSelector } from "@app/react";
import {
  appEndpointsUrl,
  appServicesUrl,
  databaseDetailUrl,
  databaseEndpointsUrl,
  endpointDetailActivityUrl,
  endpointDetailCredentialsUrl,
  endpointDetailSettingsUrl,
  endpointDetailSetupUrl,
  endpointDetailUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type {
  DeployApp,
  DeployDatabase,
  DeployEndpoint,
  DeployService,
} from "@app/types";
import { useEffect, useMemo } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
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
  type TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function EndpointAppHeaderInfo({
  enp,
  app,
  service,
  isLoading,
}: {
  enp: DeployEndpoint;
  app: DeployApp;
  service: DeployService;
  isLoading: boolean;
}) {
  const txt = getEndpointText(enp);
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const portTxt = getContainerPort(enp, image.exposedPorts);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Endpoint Details"
        isLoading={isLoading}
        icon={
          <img
            src={"/resource-types/logo-vhost.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/endpoints"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="URL">
          <div className="flex flex-row items-center gap-2">
            <EndpointUrl enp={enp} />
            <CopyTextButton text={txt.url} />
          </div>
        </DetailInfoItem>
        <DetailInfoItem title="Hostname">
          <CopyText text={txt.hostname} />
        </DetailInfoItem>
        <DetailInfoItem title="Type">
          <Code>{enp.type}</Code>
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
        {isTlsOrTcp(enp) ? (
          <DetailInfoItem title="Ports">{portTxt}</DetailInfoItem>
        ) : (
          <DetailInfoItem title="Port">{portTxt}</DetailInfoItem>
        )}
        <DetailInfoItem title="Status">
          <EndpointStatusPill status={enp.status} />
        </DetailInfoItem>
        <DetailInfoItem title="Using Header Auth">
          {txt.token_header}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

export function EndpointDatabaseHeaderInfo({
  enp,
  db,
  isLoading,
}: { enp: DeployEndpoint; db: DeployDatabase; isLoading: boolean }) {
  const txt = getEndpointText(enp);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Endpoint Details"
        isLoading={isLoading}
        icon={
          <img
            src={"/resource-types/logo-vhost.png"}
            className="w-[32px] h-[32px] mr-3"
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

        <DetailInfoItem title="Status">
          <EndpointStatusPill status={enp.status} />
        </DetailInfoItem>

        <DetailInfoItem title="Resource">
          <Link to={databaseEndpointsUrl(db.id)}>{db.handle}</Link>
        </DetailInfoItem>

        <DetailInfoItem title="IP Allowlist">{txt.ipAllowlist}</DetailInfoItem>

        <DetailInfoItem title="Placement">{txt.placement}</DetailInfoItem>
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
  isLoading,
}: {
  enp: DeployEndpoint;
  service: DeployService;
  isError: boolean;
  message: string;
  meta: Record<string, any>;
  isLoading: boolean;
}) {
  useQuery(fetchApp({ id: service.appId }));
  const app = useSelector((s) => selectAppById(s, { id: service.appId }));
  useQuery(fetchImageById({ id: app.currentImageId }));
  const serviceUrl = appServicesUrl(app.id);
  const endpointUrl = appEndpointsUrl(app.id);
  const tabs: TabItem[] = [
    { name: "Activity", href: endpointDetailActivityUrl(enp.id) },
    { name: "Settings", href: endpointDetailSettingsUrl(enp.id) },
  ];
  if (enp.acme && enp.status === "provisioned") {
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
        breadcrumbs={[
          { name: `${app.handle}`, to: serviceUrl },
          { name: "Endpoints", to: endpointUrl },
        ]}
        title={`ID: ${enp.id}`}
        lastBreadcrumbTo={endpointDetailUrl(enp.id)}
        detailsBox={
          <EndpointAppHeaderInfo
            enp={enp}
            app={app}
            service={service}
            isLoading={isLoading}
          />
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
  isLoading,
}: {
  enp: DeployEndpoint;
  service: DeployService;
  isError: boolean;
  message: string;
  meta: Record<string, any>;
  isLoading: boolean;
}) {
  useQuery(fetchDatabase({ id: service.databaseId }));
  const db = useSelector((s) =>
    selectDatabaseById(s, { id: service.databaseId }),
  );
  const dbUrl = databaseDetailUrl(db.id);
  const endpointsUrl = databaseEndpointsUrl(db.id);
  const tabs: TabItem[] = [
    { name: "Activity", href: endpointDetailActivityUrl(enp.id) },
    {
      name: "Connection URL",
      href: endpointDetailCredentialsUrl(enp.id),
    },
    { name: "Settings", href: endpointDetailSettingsUrl(enp.id) },
  ];

  return (
    <DetailPageHeaderView
      isError={isError}
      message={message}
      meta={meta}
      tabs={tabs}
      breadcrumbs={[
        { name: db.handle, to: dbUrl },
        { name: "Endpoints", to: endpointsUrl },
      ]}
      title={`ID: ${enp.id}`}
      lastBreadcrumbTo={endpointDetailUrl(enp.id)}
      detailsBox={
        <EndpointDatabaseHeaderInfo enp={enp} db={db} isLoading={isLoading} />
      }
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
  const enp = useSelector((s) => selectEndpointById(s, { id }));
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "endpoint" }));
  }, []);
  useQuery(fetchService({ id: enp.serviceId }));
  const service = useSelector((s) =>
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
