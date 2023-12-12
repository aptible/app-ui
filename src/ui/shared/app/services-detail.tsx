import {
  calcMetrics,
  calcServiceMetrics,
  fetchServicesByAppId,
  selectAppById,
  selectDatabaseById,
  selectServicesByAppId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  appDeployResumeUrl,
  appDetailUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServiceUrl,
  databaseDetailUrl,
  databaseScaleUrl,
} from "@app/routes";
import { AppState, DeployService, DeployServiceRow } from "@app/types";
import { PaginateProps, usePaginate } from "@app/ui/hooks";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ButtonCreate, ButtonLink } from "../button";
import { Code } from "../code";
import { CopyTextButton } from "../copy";
import { Group } from "../group";
import { IconChevronDown } from "../icons";
import { PreCode, listToInvertedTextColor } from "../pre-code";
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

const AppServiceListRow = ({
  service,
}: {
  service: DeployService;
}) => {
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: service.appId }),
  );
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);

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
          <div className={tokens.type["normal lighter"]}>
            {metrics.containerProfile.name}
          </div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>
            ${((metrics.estimatedCostInDollars * 1024) / 1000).toFixed(2)}
          </div>
        </Td>

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

function AppServiceTable({
  paginated,
}: { paginated: PaginateProps<DeployService> }) {
  return (
    <Table>
      <THead>
        <Th>Service</Th>
        <Th>Memory Limit</Th>
        <Th>CPU Share</Th>
        <Th>Container Count</Th>
        <Th>Profile</Th>
        <Th>Est. Monthly Cost</Th>
        <Th variant="right">Actions</Th>
      </THead>

      <TBody>
        {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
        {paginated.data.map((service) => (
          <AppServiceListRow key={service.id} service={service} />
        ))}
      </TBody>
    </Table>
  );
}

const ServiceOrgListRow = ({
  service,
}: {
  service: DeployServiceRow;
}) => {
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: service.appId }),
  );
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: service.databaseId }),
  );
  const metrics = calcServiceMetrics(service);
  const { totalCPU } = calcMetrics([service]);
  const cmd = service.command || "Docker CMD";

  return (
    <>
      <Tr>
        <Td className="w-[180px]">
          <div className="flex items-center">
            <img
              src="/resource-types/logo-service.png"
              className="w-[32px] h-[32px] mr-2 align-middle"
              aria-label="App"
            />
            <div>
              {service.appId ? (
                <Link
                  to={appServiceUrl(service.appId, service.id)}
                  className="text-black group-hover:text-indigo hover:text-indigo"
                >
                  {service.processType}
                </Link>
              ) : null}
              {service.databaseId ? (
                <Link
                  to={databaseDetailUrl(service.databaseId)}
                  className="text-black group-hover:text-indigo hover:text-indigo"
                >
                  {service.processType}
                </Link>
              ) : null}
              <div className={tokens.type["normal lighter"]}>
                ID: {service.id}
              </div>
            </div>
          </div>
        </Td>

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
            {service.databaseId ? (
              <Link
                to={databaseDetailUrl(service.databaseId)}
                className="text-black group-hover:text-indigo hover:text-indigo w-[130px] text-ellipsis inline-block whitespace-nowrap overflow-hidden"
              >
                {db.handle}
              </Link>
            ) : null}
            <div className={tokens.type["normal lighter"]}>
              {service.appId ? "App" : "Database"}
            </div>
          </div>
        </Td>

        <EnvStackCell environmentId={service.environmentId} />

        <Td>
          <Group size="sm" variant="horizontal" className="items-center">
            <div className="w-[150px]">
              {cmd.length > 15 ? (
                <Group variant="horizontal" size="sm">
                  <Tooltip text={cmd} fluid>
                    <Code className="text-ellipsis">{cmd.slice(0, 15)}</Code>
                  </Tooltip>
                  <CopyTextButton text={cmd} />
                </Group>
              ) : (
                <Code>{cmd}</Code>
              )}
            </div>
          </Group>
        </Td>

        <Td className={tokens.type.darker}>
          <div className={tokens.type.darker}>
            {service.containerCount} Container
          </div>
          <div className={tokens.type["normal lighter"]}>
            {metrics.containerSizeGB} GB · {totalCPU} CPU
          </div>
        </Td>

        <Td>
          <div className={tokens.type.darker}>${service.cost.toFixed(2)}</div>
        </Td>

        <Td variant="right">
          <div className="h-[40px] flex items-center">
            <ButtonLink
              size="sm"
              to={
                service.appId
                  ? appServiceScalePathUrl(app.id, service.id)
                  : databaseScaleUrl(service.databaseId)
              }
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

export function ServiceByOrgTable({
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
          Resource{" "}
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
        {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
        {paginated.data.map((service) => (
          <ServiceOrgListRow key={service.id} service={service} />
        ))}
      </TBody>
    </Table>
  );
}

export function AppServicesOverview({
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

      <AppServiceTable paginated={paginated} />
    </Group>
  );
}
