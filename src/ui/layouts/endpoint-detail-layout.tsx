import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";

import {
  cancelFetchEndpointPoll,
  fetchApp,
  fetchDatabase,
  fetchService,
  getEndpointText,
  pollFetchEndpoint,
  requiresAcmeSetup,
  selectAppById,
  selectDatabaseById,
  selectEndpointById,
  selectServiceById,
} from "@app/deploy";
import {
  appEndpointsUrl,
  databaseDetailUrl,
  endpointDetailActivityUrl,
  endpointDetailSettingsUrl,
  endpointDetailSetupUrl,
} from "@app/routes";
import type {
  AppState,
  DeployApp,
  DeployEndpoint,
  DeployService,
} from "@app/types";

import { usePoller } from "../hooks";
import {
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
import { MenuWrappedPage } from "./menu-wrapped-page";
import { setResourceStats } from "@app/search";
import { useEffect, useMemo } from "react";

export function EndpointAppHeaderInfo({
  enp,
  app,
}: { enp: DeployEndpoint; app: DeployApp }) {
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
          <EndpointUrl enp={enp} />
        </DetailInfoItem>
        <DetailInfoItem title="Placement">{txt.placement}</DetailInfoItem>

        <DetailInfoItem title="Resource">
          <Link to={appEndpointsUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="IP Allowlist">{txt.ipAllowlist}</DetailInfoItem>
        <DetailInfoItem title="">
          <div />
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <EndpointStatusPill status={enp.status} />
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function EndpointAppHeader({
  enp,
  service,
}: { enp: DeployEndpoint; service: DeployService }) {
  useQuery(fetchApp({ id: service.appId }));
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: service.appId }),
  );
  const url = appEndpointsUrl(app.id);
  const tabs: TabItem[] = [
    { name: "Activity", href: endpointDetailActivityUrl(enp.id) },
    { name: "Settings", href: endpointDetailSettingsUrl(enp.id) },
  ];
  if (requiresAcmeSetup(enp)) {
    tabs.push({ name: "Finish Setup", href: endpointDetailSetupUrl(enp.id) });
  }

  return (
    <DetailPageHeaderView
      tabs={tabs}
      breadcrumbs={[{ name: app.handle, to: url }]}
      title={`Endpoint: ${enp.id}`}
      detailsBox={<EndpointAppHeaderInfo enp={enp} app={app} />}
    />
  );
}

function EndpointDatabaseHeader({
  enp,
  service,
}: { enp: DeployEndpoint; service: DeployService }) {
  useQuery(fetchDatabase({ id: service.databaseId }));
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: service.databaseId }),
  );
  const url = databaseDetailUrl(db.id);

  return (
    <DetailPageHeaderView
      breadcrumbs={[{ name: db.handle, to: url }]}
      title={`Endpoint: ${enp.id}`}
      detailsBox={<div>Not implemented yet.</div>}
    />
  );
}

function EndpointPageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const action = useMemo(() => pollFetchEndpoint({ id }), [id]);
  const cancel = useMemo(() => cancelFetchEndpointPoll(), []);
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
    return <EndpointAppHeader enp={enp} service={service} />;
  }

  if (service.databaseId) {
    return <EndpointDatabaseHeader enp={enp} service={service} />;
  }

  return <Loading text="Loading endpoint information..." />;
}

export const EndpointDetailLayout = () => {
  return (
    <MenuWrappedPage header={<EndpointPageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};
