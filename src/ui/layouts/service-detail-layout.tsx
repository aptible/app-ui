import {
  calcMetrics,
  calcServiceMetrics,
  fetchApp,
  fetchEndpointsByServiceId,
  fetchServicesByAppId,
  selectAppById,
  selectEndpointsByServiceId,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import { findLoaderComposite } from "@app/loaders";
import { useDispatch, useQuery, useSelector } from "@app/react";
import {
  appDetailUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServiceSettingsPathUrl,
  appServiceUrl,
  appServicesUrl,
  environmentAppsUrl,
  environmentDetailUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import type {
  DeployApp,
  DeployEndpoint,
  DeployEnvironment,
  DeployService,
} from "@app/types";
import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  CostEstimateTooltip,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconChevronDown,
  IconChevronRight,
  PreCode,
  type TabItem,
  listToInvertedTextColor,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

const getDeploymentStrategy = (
  service: DeployService,
  endpoints: DeployEndpoint[],
) => {
  if (endpoints.length > 0) {
    if (
      endpoints.find(
        (e) => e.type === "http" || e.type === "http_proxy_protocol",
      )
    ) {
      return "Zero-Downtime";
    }
    return "Minimal-Downtime";
  }

  const strategies = [];
  if (service.forceZeroDowntime) {
    strategies.push("Zero-Downtime");
  } else {
    strategies.push("Zero-Overlap");
  }
  if (service.naiveHealthCheck) {
    strategies.push("Simple Healthcheck");
  }
  return strategies.join(", ");
};

export function ServiceHeader({
  app,
  service,
  endpoints,
  env,
  isLoading,
}: {
  app: DeployApp;
  service: DeployService;
  endpoints: DeployEndpoint[];
  env: DeployEnvironment;
  isLoading: boolean;
}) {
  // Query additional data that subpages need
  useQuery(fetchEndpointsByServiceId({ id: service.id }));

  const metrics = calcServiceMetrics(service, endpoints);
  const { totalCPU } = calcMetrics([service]);
  const [isOpen, setOpen] = useState(true);
  const deploymentStrategy = getDeploymentStrategy(service, endpoints);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Service Details"
        isLoading={isLoading}
        icon={
          <img
            src="/resource-types/logo-service.png"
            className="w-[32px] h-[32px] mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/services"
      />

      <DetailInfoGrid columns={3}>
        <DetailInfoItem title="ID">{service.id}</DetailInfoItem>
        <DetailInfoItem title="Container Size">
          {metrics.containerSizeGB} GB
        </DetailInfoItem>
        <DetailInfoItem title="Type">{service.processType}</DetailInfoItem>
        <DetailInfoItem title="App">
          <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Container Count">
          {service.containerCount}
        </DetailInfoItem>
        <DetailInfoItem title="CPU Share">{totalCPU}</DetailInfoItem>
        <DetailInfoItem title="Environment">
          <Link to={environmentDetailUrl(env.id)}>{env.handle}</Link>
        </DetailInfoItem>
        <DetailInfoItem title="Est. Monthly Cost">
          <CostEstimateTooltip cost={metrics.estimatedCostInDollars} />
        </DetailInfoItem>
        <DetailInfoItem title="Container Profile">
          {metrics.containerProfile.name}
        </DetailInfoItem>
        <DetailInfoItem title="Deployment Strategy">
          <Link to={appServiceSettingsPathUrl(app.id, service.id)}>
            {deploymentStrategy}
          </Link>
        </DetailInfoItem>
      </DetailInfoGrid>
      {service.command ? (
        <div>
          <div className="-ml-2 flex justify-between items-center pt-1">
            <div className="flex flex-1">
              <div
                className="font-semibold flex items-center cursor-pointer"
                onClick={() => setOpen(!isOpen)}
                onKeyUp={() => setOpen(!isOpen)}
              >
                {isOpen ? (
                  <IconChevronDown variant="sm" />
                ) : (
                  <IconChevronRight variant="sm" />
                )}
                <p>Show Command</p>
              </div>
            </div>
          </div>
          {isOpen ? (
            <PreCode
              segments={listToInvertedTextColor(service.command.split(" "))}
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

  const loaderApp = useQuery(fetchApp({ id }));
  const loaderServices = useQuery(fetchServicesByAppId({ id: id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const endpoints = useSelector((s) =>
    selectEndpointsByServiceId(s, { serviceId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const loader = findLoaderComposite([loaderApp, loaderServices]);

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
    { name: "Settings", href: appServiceSettingsPathUrl(id, serviceId) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={serviceId ? service.processType : app.handle}
      detailsBox={
        <ServiceHeader
          app={app}
          service={service}
          endpoints={endpoints}
          env={environment}
          isLoading={loader.isLoading}
        />
      }
      tabs={tabs}
      lastBreadcrumbTo={appServiceUrl(app.id, service.id)}
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
