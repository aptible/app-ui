import {
  calcMetrics,
  calcServiceMetrics,
  fetchServiceSizingPoliciesByEnvironmentId,
  fetchServicesByAppId,
  selectAppById,
  selectAutoscalingEnabledById,
  selectEnvironmentById,
  selectServiceRowsByAppId,
  selectStackById,
  serviceCommandText,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import {
  appDeployResumeUrl,
  appDetailUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServiceUrl,
} from "@app/routes";
import { DeployService, DeployServiceRow, DeployStack } from "@app/types";
import { PaginateProps, usePaginate } from "@app/ui/hooks";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ButtonCreate, ButtonLink } from "../button";
import { Code } from "../code";
import { CopyTextButton } from "../copy";
import { Group } from "../group";
import { IconChevronDown, IconInfo } from "../icons";
import { Pill } from "../pill";
import {
  ActionBar,
  DescBar,
  FilterBar,
  PaginateBar,
} from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";
import { Tooltip } from "../tooltip";

const NameCell = ({ service }: { service: DeployService }) => {
  return (
    <Td className="w-[180px]">
      <div className="flex">
        <Link to={appServiceUrl(service.appId, service.id)} className="flex">
          <img
            src="/resource-types/logo-service.png"
            className="w-[32px] h-[32px] mr-2 mt-1 align-middle"
            aria-label="Service"
          />
          <p className="flex flex-col">
            <span className={tokens.type["table link"]}>
              {service.processType}
            </span>
            <span className={tokens.type["normal lighter"]}>
              ID: {service.id}
            </span>
          </p>
        </Link>
      </div>
    </Td>
  );
};

const CmdCell = ({
  service,
  size = "sm",
}: { service: DeployService; size?: "sm" | "lg" }) => {
  const cmd = serviceCommandText(service);
  const sizes = {
    sm: 30,
    lg: 30,
  };
  const charLen = sizes[size];
  return (
    <Td>
      <Group size="sm" variant="horizontal" className="items-center">
        <div>
          {cmd.length > charLen ? (
            <Group variant="horizontal" size="sm" className="items-center">
              <Tooltip text={cmd} fluid>
                <Code className="text-ellipsis whitespace-nowrap max-w-[30ch] overflow-hidden inline-block">
                  {cmd.slice(0, charLen)}
                </Code>
              </Tooltip>
              <CopyTextButton text={cmd} />
            </Group>
          ) : (
            <Group variant="horizontal" size="sm" className="items-center">
              <Code>{cmd}</Code>
              <CopyTextButton text={cmd} />
            </Group>
          )}
        </div>
      </Group>
    </Td>
  );
};

const DetailsCell = ({ service }: { service: DeployService }) => {
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);
  return (
    <Td className={tokens.type.darker}>
      <div className={tokens.type.darker}>
        {service.containerCount} Container
      </div>
      <div className={tokens.type["normal lighter"]}>
        {metrics.containerSizeGB} GB · {totalCPU} CPU
      </div>
    </Td>
  );
};

const CostCell = ({
  service,
  evaluateAutoscaling = false,
}: { service: DeployServiceRow; evaluateAutoscaling?: boolean }) => {
  const hideCost =
    evaluateAutoscaling &&
    useSelector((s) =>
      selectAutoscalingEnabledById(s, { id: service.serviceSizingPolicyId }),
    );

  return (
    <Td>
      <div className={tokens.type.darker}>
        {hideCost ? (
          <Group variant="horizontal" size="sm" className="items-center">
            <div>Unavailable</div>
            <Tooltip
              fluid
              className="inline-block"
              text="Cost cannot be estimated when autoscaling is enabled."
            >
              <IconInfo variant="sm" className="opacity-50 hover:opacity-100" />
            </Tooltip>
          </Group>
        ) : (
          `$${service.cost.toFixed(2)}`
        )}
      </div>
    </Td>
  );
};

const AutoscaleCell = ({ service }: { service: DeployServiceRow }) => {
  const enabled = useSelector((s) =>
    selectAutoscalingEnabledById(s, { id: service.serviceSizingPolicyId }),
  );
  const variant = enabled ? "success" : "default";
  const text = enabled ? "Enabled" : "Disabled";

  return (
    <Td>
      <Pill variant={variant}>{text}</Pill>
    </Td>
  );
};

const AppServiceByAppRow = ({
  service,
  stack,
}: {
  service: DeployServiceRow;
  stack: DeployStack;
}) => {
  const app = useSelector((s) => selectAppById(s, { id: service.appId }));

  return (
    <Tr>
      <NameCell service={service} />

      <CmdCell service={service} size="lg" />
      <DetailsCell service={service} />
      <CostCell
        service={service}
        evaluateAutoscaling={stack.verticalAutoscaling}
      />
      {stack.verticalAutoscaling ? <AutoscaleCell service={service} /> : null}

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
  );
};

const AppServiceByOrgRow = ({
  service,
}: {
  service: DeployServiceRow;
}) => {
  const app = useSelector((s) => selectAppById(s, { id: service.appId }));

  return (
    <>
      <Tr>
        <NameCell service={service} />

        <Td>
          <div className="flex flex-col gap-0">
            {service.appId ? (
              <Link
                to={appDetailUrl(service.appId)}
                className="text-black group-hover:text-indigo hover:text-indigo w-[130px] text-ellipsis inline-block whitespace-nowrap overflow-hidden"
              >
                {app.handle}
              </Link>
            ) : null}
          </div>
        </Td>

        <EnvStackCell environmentId={service.environmentId} />
        <CmdCell service={service} />
        <DetailsCell service={service} />
        <CostCell service={service} />

        <Td variant="right">
          <div className="h-[40px] flex items-center">
            <ButtonLink
              size="sm"
              to={appServiceScalePathUrl(app.id, service.id)}
              variant="primary"
            >
              Scale
            </ButtonLink>
          </div>
        </Td>
      </Tr>
    </>
  );
};

export function AppServicesByOrg({
  paginated,
  onSort,
}: {
  paginated: PaginateProps<DeployServiceRow>;
  onSort: (sortDir: keyof DeployServiceRow) => void;
}) {
  return (
    <Table>
      <THead>
        <Th
          className="cursor-pointer hover:text-black group"
          onClick={() => onSort("id")}
        >
          Service{" "}
          <div className="inline-block">
            <IconChevronDown
              variant="sm"
              className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
            />
          </div>
        </Th>
        <Th
          className="cursor-pointer hover:text-black group"
          onClick={() => onSort("resourceHandle")}
        >
          App{" "}
          <div className="inline-block">
            <IconChevronDown
              variant="sm"
              className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
            />
          </div>
        </Th>
        <Th>Environment</Th>
        <Th>Command</Th>
        <Th>Details</Th>
        <Th
          className="cursor-pointer hover:text-black group"
          onClick={() => onSort("cost")}
        >
          Est. Monthly Cost{" "}
          <div className="inline-block">
            <IconChevronDown
              variant="sm"
              className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
            />
          </div>
        </Th>
        <Th variant="right">Actions</Th>
      </THead>

      <TBody>
        {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
        {paginated.data.map((service) => (
          <AppServiceByOrgRow key={service.id} service={service} />
        ))}
      </TBody>
    </Table>
  );
}

export function AppServicesByApp({
  appId,
}: {
  appId: string;
}) {
  const navigate = useNavigate();
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const services = useSelector((s) => selectServiceRowsByAppId(s, { appId }));
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const stack = useSelector((s) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const onDeploy = () => {
    navigate(appDeployResumeUrl(app.id));
  };
  useQuery(fetchServicesByAppId({ id: app.id }));
  useQuery(
    fetchServiceSizingPoliciesByEnvironmentId({ id: app.environmentId }),
  );
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
          <Th>Command</Th>
          <Th>Details</Th>
          <Th>Est. Monthly Cost</Th>
          {stack.verticalAutoscaling ? <Th>Autoscaling</Th> : null}
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? (
            <EmptyTr colSpan={stack.verticalAutoscaling ? 6 : 5} />
          ) : null}
          {paginated.data.map((service) => (
            <AppServiceByAppRow
              key={service.id}
              service={service}
              stack={stack}
            />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
