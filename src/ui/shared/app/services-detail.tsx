import { useSelector } from "react-redux";

import {
  calcServiceMetrics,
  selectAppById,
  selectServicesByIds,
} from "@app/deploy";
import { AppState, DeployApp, DeployService } from "@app/types";

import { ButtonLink } from "../button";
import { PreCode, listToInvertedTextColor } from "../pre-code";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { appServicePathUrl } from "@app/routes";

const serviceListRow = ({
  app,
  service,
}: {
  app?: DeployApp;
  service?: DeployService;
}): React.ReactNode[] => {
  if (!app || !service) return [];
  const metrics = calcServiceMetrics(service);

  return [
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
        <div className={tokens.type.darker}>{service.containerCount}</div>
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
          ${metrics.estimatedCostInDollars}
        </div>
      </Td>
      <Td className="flex-1">
        <ButtonLink
          className="w-20"
          size="sm"
          to={appServicePathUrl(app.id, service.id)}
          variant="primary"
        >
          Metrics
        </ButtonLink>
      </Td>
    </tr>,
    service.command ? (
      <tr
        className="group hover:bg-gray-50"
        key={`${service.id}.${service.command}`}
        className="border-none"
      >
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
    ) : null,
  ];
};

export function ServicesOverview({
  appId,
  serviceIds,
}: {
  appId: string;
  serviceIds: string[];
}) {
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: serviceIds }),
  );

  return (
    <div className="mb-4">
      <ResourceListView
        header={
          <>
            <div className="text-base text-gray-500 mb-4 select-none">
              <span>{serviceIds.length} Services</span>
            </div>
          </>
        }
        tableHeader={
          <TableHead
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
            {serviceIds.map((serviceId) =>
              serviceListRow({
                app,
                service: services.find(
                  (service: DeployService) => service.id === serviceId,
                ),
              }),
            )}
          </>
        }
      />
    </div>
  );
}
