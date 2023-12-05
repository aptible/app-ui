import {
  calcMetrics,
  calcServiceMetrics,
  fetchApp,
  fetchServicesByAppId,
  selectAppById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  appDetailUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServicesUrl,
  environmentAppsUrl,
  environmentDetailUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type {
  AppState,
  DeployApp,
  DeployEnvironment,
  DeployService,
} from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  PreCode,
  TabItem,
  listToInvertedTextColor,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function ServiceHeader({
  app,
  service,
  env,
}: { app: DeployApp; service: DeployService; env: DeployEnvironment }) {
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);
  const [isOpen, setOpen] = useState(false);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Service Details"
        icon={
          <img
            src="/resource-types/logo-service.png"
            className="w-[32px] h-[32px] mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/services"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{service.id}</DetailInfoItem>
        <DetailInfoItem title="Type">{service.processType}</DetailInfoItem>
        <DetailInfoItem title="App">
          <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Environment">
          <Link to={environmentDetailUrl(env.id)}>{env.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Container Size">
          {metrics.containerSizeGB} GB
        </DetailInfoItem>
        <DetailInfoItem title="CPU Share">{totalCPU}</DetailInfoItem>
        <DetailInfoItem title="Container Count">
          {service.containerCount}
        </DetailInfoItem>
        <DetailInfoItem title="Container Profile">
          {metrics.containerProfile.name}
        </DetailInfoItem>
        <DetailInfoItem title="Cost">
          ${((metrics.estimatedCostInDollars * 1024) / 1000).toFixed(2)}
        </DetailInfoItem>
      </DetailInfoGrid>
      {service.command ? (
          <div>
            <div className="-ml-2 flex justify-between items-center">
              <div className="flex flex-1">
                <div
                  className="font-semibold flex items-center cursor-pointer"
                  onClick={() => setOpen(!isOpen)}
                  onKeyUp={() => setOpen(!isOpen)}
                >
                  {isOpen ? <IconChevronDown /> : <IconChevronRight />}
                  <p>Command</p>
                </div>
              </div>
            </div>
            {isOpen ? (
              <PreCode
                    segments={listToInvertedTextColor(["git clone"])}
                    allowCopy
                  />
            ) : null}
          </div>
        ) : null}
    </DetailHeader>
  );
}

function ServicePageHeader() {
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
    {
      name: app.handle,
      to: appServicesUrl(app.id),
    },
  ];

  const tabs: TabItem[] = [
    { name: "Metrics", href: appServicePathMetricsUrl(id, serviceId) },
    { name: "Scale", href: appServiceScalePathUrl(id, serviceId) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={serviceId ? service.processType : app.handle}
      detailsBox={
        <ServiceHeader app={app} service={service} env={environment} />
      }
      tabs={tabs}
    />
  );
}

export const ServiceDetailLayout = () => {
  return (
    <AppSidebarLayout header={<ServicePageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
