import {
  calcMetrics,
  calcServiceMetrics,
  fetchServicesByAppId,
  selectAppById,
  selectServicesByAppId,
} from "@app/deploy";
import {
  appDeployResumeUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
} from "@app/routes";
import { AppState, DeployApp, DeployService } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useQuery } from "saga-query/react";
import { ButtonCreate, ButtonLink } from "../button";
import { Group } from "../group";
import { PreCode, listToInvertedTextColor } from "../pre-code";
import {
  ActionBar,
  DescBar,
  FilterBar,
  PaginateBar,
  TitleBar,
} from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
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
      <Tr>
        <Td className="flex-1 pl-4">
          <div className="text-base font-semibold text-gray-900">
            {service.processType}
          </div>
          <div className={tokens.type["normal lighter"]}>ID: {service.id}</div>
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
        <Td className="flex justify-end gap-2 mr-4">
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
      </Tr>
      {service.command ? (
        <Tr>
          <td colSpan={7} className="p-4">
            <span className="text-sm text-gray-500">Command</span>
            <div>
              <PreCode
                allowCopy
                segments={listToInvertedTextColor(service.command.split(" "))}
              />
            </div>
          </td>
        </Tr>
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
    navigate(appDeployResumeUrl(app.id));
  };
  useQuery(fetchServicesByAppId({ id: app.id }));
  const paginated = usePaginate(services);

  return (
    <Group>
      <Group size="sm">
        <FilterBar>
          <ActionBar>
            <ButtonCreate
              className="w-fit"
              envId={app.environmentId}
              onClick={onDeploy}
            >
              Deployment Monitor
            </ButtonCreate>
          </ActionBar>

          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Services</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Service</Th>
          <Th>Memory Limit</Th>
          <Th>CPU Share</Th>
          <Th>Container Count</Th>
          <Th>Profile</Th>
          <Th>Monthly Cost</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((service) => (
            <ServiceListRow key={service.id} app={app} service={service} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
