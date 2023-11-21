import {
  calcMetrics,
  calcServiceMetrics,
  fetchServicesByAppId,
  selectAppById,
  selectEnvironmentById,
  selectServicesByAppId,
  selectStackById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  appDeployResumeUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
} from "@app/routes";
import { AppState, DeployApp, DeployService } from "@app/types";
import { usePaginate, useServiceSizingPolicy } from "@app/ui/hooks";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ButtonCreate, ButtonLink } from "../button";
import { Group } from "../group";
import { PreCode, listToInvertedTextColor } from "../pre-code";
import {
  ActionBar,
  DescBar,
  FilterBar,
  PaginateBar,
} from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";

const ServiceListRow = ({
  app,
  service,
  verticalAutoscaling,
}: {
  app: DeployApp;
  service: DeployService;
  verticalAutoscaling: boolean;
}) => {
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);
  const { existingPolicy } = useServiceSizingPolicy(service.id);
  const autoscalingEnabled = existingPolicy.scaling_enabled;

  return (
    <>
      <Tr>
        <Td>
          <Link to={appServicePathMetricsUrl(app.id, service.id)}>
            <div className="text-base font-semibold text-gray-900">
              {service.processType}
            </div>
          </Link>
          <div className={tokens.type["normal lighter"]}>ID: {service.id}</div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>{metrics.containerSizeGB} GB</div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>{totalCPU}</div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>{service.containerCount}</div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>
            {metrics.containerProfile.name}
          </div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>
            ${((metrics.estimatedCostInDollars * 1024) / 1000).toFixed(2)}
          </div>
        </Td>

        {verticalAutoscaling ? (
          <Td variant="center">
            <div className={tokens.type.darker}>
              {autoscalingEnabled ? "Enabled" : "Disabled"}
            </div>
          </Td>
        ) : null}

        <Td variant="right">
          <Group size="sm" variant="horizontal">
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
          </Group>
        </Td>
      </Tr>

      {service.command ? (
        <Tr>
          <Td colSpan={7} className="pr-4">
            <span className="text-sm text-gray-500">Command</span>
            <div>
              <PreCode
                allowCopy
                segments={listToInvertedTextColor(service.command.split(" "))}
              />
            </div>
          </Td>
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
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );

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
          {stack.verticalAutoscaling ? (
            <Th variant="center">Autoscaling</Th>
          ) : null}
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? (
            <EmptyTr colSpan={stack.verticalAutoscaling ? 8 : 7} />
          ) : null}
          {paginated.data.map((service) => (
            <ServiceListRow
              key={service.id}
              app={app}
              service={service}
              verticalAutoscaling={stack.verticalAutoscaling}
            />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
