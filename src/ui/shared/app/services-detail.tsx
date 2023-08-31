import { useSelector } from "react-redux";

import {
  calcMetrics,
  calcServiceMetrics,
  fetchServicesByAppId,
  selectAppById,
  selectServicesByAppId,
} from "@app/deploy";
import { AppState, DeployApp, DeployService } from "@app/types";

import {
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  createProjectGitAppSetupUrl,
} from "@app/routes";
import { useNavigate } from "react-router";
import { useQuery } from "saga-query/react";
import { ButtonCreate, ButtonLink } from "../button";
import { PreCode, listToInvertedTextColor } from "../pre-code";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

const ServiceListRow = ({
  app,
  service,
}: {
  app: DeployApp;
  service: DeployService;
}) => {
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);

  return (
    <>
      <tr className="group hover:bg-gray-50" key={`${service.id}`}>
        <Td className="flex-1 pl-4">
          <div className={tokens.type.darker}>{service.handle}</div>
          <div className={tokens.type["normal lighter"]}>ID: {service.id}</div>
          <div className={tokens.type["normal lighter"]}>
            {service.processType}
          </div>
        </Td>

        <Td className="flex-1">
          <div className={tokens.type.darker}>{metrics.containerSizeGB} GB</div>
        </Td>

        <Td className="flex-1">
          <div className={tokens.type.darker}>{totalCPU}</div>
        </Td>

        <Td className="flex-1">
          <div className={tokens.type.darker}>{service.containerCount}</div>
        </Td>

        <Td className="flex-1">
          <div className={tokens.type["normal lighter"]}>
            {metrics.containerProfile.name}
          </div>
        </Td>

        <Td className="flex-1">
          <div className={tokens.type.darker}>
            ${((metrics.estimatedCostInDollars * 1024) / 1000).toFixed(2)}
          </div>
        </Td>
        <Td className="flex justify-end gap-2 mr-4 mt-4">
          <ButtonLink
            className="w-15"
            size="sm"
            to={appServicePathMetricsUrl(app.id, service.id)}
            variant="primary"
          >
            Metrics
          </ButtonLink>
          <ButtonLink
            className="w-15"
            size="sm"
            to={appServiceScalePathUrl(app.id, service.id)}
            variant="primary"
          >
            Scale
          </ButtonLink>
        </Td>
      </tr>
      {service.command ? (
        <tr key={`${service.id}.${service.command}`} className="border-none">
          <td colSpan={7} className="p-4">
            <span className="text-sm text-gray-500">Command</span>
            <div>
              <PreCode
                allowCopy
                segments={listToInvertedTextColor(service.command.split(" "))}
              />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};

export function ServicesOverview({
  appId,
}: {
  appId: string;
}) {
  const navigate = useNavigate();
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const services = useSelector((s: AppState) =>
    selectServicesByAppId(s, { appId }),
  );
  const onDeploy = () => {
    navigate(createProjectGitAppSetupUrl(app.id));
  };
  useQuery(fetchServicesByAppId({ id: app.id }));

  return (
    <div className="mb-4">
      <ResourceListView
        header={
          <>
            <div className="text-base text-gray-500 mb-4 select-none flex justify-between items-center">
              <span>{services.length} Services</span>
              <ButtonCreate envId={app.environmentId} onClick={onDeploy}>
                Deployment Monitor
              </ButtonCreate>
            </div>
          </>
        }
        tableHeader={
          <TableHead
            rightAlignedFinalCol
            headers={[
              "Service",
              "Memory Limit",
              "CPU Share",
              "Container Count",
              "Profile",
              "Monthly Cost",
              "Actions",
            ]}
          />
        }
        tableBody={
          <>
            {services.map((service) => (
              <ServiceListRow key={service.id} app={app} service={service} />
            ))}
          </>
        }
      />
    </div>
  );
}
