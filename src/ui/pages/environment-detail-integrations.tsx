import { prettyDateTime } from "@app/date";
import {
  deprovisionLogDrain,
  deprovisionMetricDrain,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  isLogDrainHttps,
  restartLogDrain,
  selectDatabaseById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import {
  createLogDrainUrl,
  createMetricDrainUrl,
  databaseDetailUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import { DeployLogDrain, DeployMetricDrain } from "@app/types";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { usePaginate } from "../hooks";
import {
  ButtonDestroy,
  ButtonOps,
  Code,
  CopyTextButton,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconPlusCircle,
  PaginateBar,
  Pill,
  PillVariant,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tooltip,
  Tr,
  tokens,
} from "../shared";

const DrainStatusPill = ({
  drain,
}: { drain: DeployLogDrain | DeployMetricDrain }) => {
  let pillVariant: PillVariant = "progress";
  if (
    drain.status === "pending" ||
    drain.status === "provisioning" ||
    drain.status === "deprovisioning"
  ) {
    pillVariant = "pending";
  }
  if (drain.status === "provisioned") {
    pillVariant = "success";
  }
  if (
    drain.status === "deprovision_failed" ||
    drain.status === "provision_failed"
  ) {
    pillVariant = "error";
  }

  return <Pill variant={pillVariant}>{capitalize(drain.status)}</Pill>;
};

const LogDrainPrimaryCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <DrainStatusPill drain={logDrain} />
      </div>
    </Td>
  );
};

const LogDrainHandleCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{logDrain.handle}</span>
          <br />
          <span className={tokens.type["small lighter"]}>
            {capitalize(logDrain.drainType.replace("_", " "))}
          </span>
        </p>
      </div>
    </Td>
  );
};

const LogDrainSourcesCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  const drainSources = [];
  if (logDrain.drainApps) {
    drainSources.push("Apps");
  }
  if (logDrain.drainDatabases) {
    drainSources.push("Databases");
  }
  if (logDrain.drainEphemeralSessions) {
    drainSources.push("SSH Sessions");
  }
  if (logDrain.drainProxies) {
    drainSources.push("Proxies");
  }

  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {drainSources.length > 0 ? drainSources.join(", ") : "N/A"}
          </span>
        </p>
      </div>
    </Td>
  );
};

const LogDrainLastUpdatedCell = ({
  logDrain,
}: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {capitalize(prettyDateTime(logDrain.updatedAt))}
          </span>
        </p>
      </div>
    </Td>
  );
};

const LogDrainActions = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const restartAction = restartLogDrain({ id: logDrain.id });
  const restartLoader = useLoader(restartAction);
  const submitRestart = () => {
    dispatch(restartAction);
  };
  useLoaderSuccess(restartLoader, () => {
    navigate(operationDetailUrl(restartLoader.meta.opId));
  });

  const deprovisionAction = deprovisionLogDrain({ id: logDrain.id });
  const deprovisionLoader = useLoader(deprovisionAction);
  const submitDeprovision = () => {
    dispatch(deprovisionAction);
  };
  useLoaderSuccess(deprovisionLoader, () => {
    navigate(operationDetailUrl(deprovisionLoader.meta.opId));
  });

  return (
    <Td className="flex justify-end gap-2 mr-4">
      <Group variant="horizontal" size="sm">
        {logDrain.drainType === "tail" ? (
          <ButtonOps
            size="sm"
            envId={logDrain.environmentId}
            className="semibold"
            onClick={submitRestart}
            isLoading={restartLoader.isLoading}
            disabled={logDrain.backendChannel === "log_forwarder"}
          >
            Restart
          </ButtonOps>
        ) : null}

        <ButtonDestroy
          size="sm"
          envId={logDrain.environmentId}
          className="semibold"
          onClick={submitDeprovision}
          isLoading={deprovisionLoader.isLoading}
          variant="delete"
          requireConfirm
        >
          Delete
        </ButtonDestroy>
      </Group>
    </Td>
  );
};

const LogDrainDestinationCell = ({
  logDrain,
}: { logDrain: DeployLogDrain }) => {
  const database = useSelector((s) =>
    selectDatabaseById(s, { id: logDrain.databaseId }),
  );
  if (logDrain.drainType === "tail") {
    return (
      <Tooltip
        relative={false}
        autoSizeWidth
        className="absolute"
        text="This log drain was automatically provisioned to support `aptible logs` in this environment. Access these logs via the Aptible CLI."
      >
        <Code>Destination</Code>
      </Tooltip>
    );
  }

  if (logDrain.drainType === "elasticsearch_database") {
    return (
      <>
        <Link to={databaseDetailUrl(database.id)}>{database.handle}</Link>
        {logDrain.loggingToken ? (
          <>
            <Tooltip text={logDrain.loggingToken}>Pipeline</Tooltip>
            <CopyTextButton text={logDrain.loggingToken} />
          </>
        ) : null}
      </>
    );
  }

  if (isLogDrainHttps(logDrain)) {
    return (
      <>
        <Tooltip text={logDrain.url}>
          <Code>URL</Code>
        </Tooltip>
        <CopyTextButton text={logDrain.url} />
      </>
    );
  }

  if (logDrain.drainType === "syslog_tls_tcp") {
    return (
      <Group variant="horizontal" size="sm" className="items-center">
        <Code>
          {logDrain.drainHost}:{logDrain.drainPort}
        </Code>
        {logDrain.loggingToken ? (
          <>
            <Tooltip text={logDrain.loggingToken}>Token</Tooltip>
            <CopyTextButton text={logDrain.loggingToken} />
          </>
        ) : null}
      </Group>
    );
  }

  return null;
};

const LogDrainTable = ({ envId }: { envId: string }) => {
  useQuery(fetchEnvLogDrains({ id: envId }));
  const logDrains = useSelector((s) => selectLogDrainsByEnvId(s, { envId }));
  const paginated = usePaginate(logDrains);

  return (
    <Group>
      <Group size="sm">
        <FilterBar>
          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Log Drains</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Status</Th>
          <Th>Handle</Th>
          <Th variant="center">Destination</Th>
          <Th>Sources</Th>
          <Th>Last Updated</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
          {paginated.data.map((drain) => (
            <Tr key={drain.id}>
              <LogDrainPrimaryCell logDrain={drain} />
              <LogDrainHandleCell logDrain={drain} />
              <Td
                variant="center"
                className="flex justify-center items-center h-full"
              >
                <LogDrainDestinationCell logDrain={drain} />
              </Td>
              <LogDrainSourcesCell logDrain={drain} />
              <LogDrainLastUpdatedCell logDrain={drain} />
              <LogDrainActions logDrain={drain} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

const MetricDrainPrimaryCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <DrainStatusPill drain={metricDrain} />
      </div>
    </Td>
  );
};

const MetricDrainHandleCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{metricDrain.handle}</span>
          <br />
          <span className={tokens.type["small lighter"]}>
            {capitalize(metricDrain.drainType.replace("_", " "))}
          </span>
        </p>
      </div>
    </Td>
  );
};

const MetricDrainDatabaseCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  const database = useSelector((s) =>
    selectDatabaseById(s, { id: metricDrain.databaseId }),
  );
  return (
    <Td className="flex-1">
      <Link to={databaseDetailUrl(database.id)}>{database.handle}</Link>
    </Td>
  );
};

const MetricDrainLastUpdatedCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {prettyDateTime(metricDrain.updatedAt)}
          </span>
        </p>
      </div>
    </Td>
  );
};

const MetricDrainActions = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const deprovisionAction = deprovisionMetricDrain({ id: metricDrain.id });
  const deprovisionLoader = useLoader(deprovisionAction);
  const submitDeprovision = () => {
    dispatch(deprovisionAction);
  };
  useLoaderSuccess(deprovisionLoader, () => {
    navigate(operationDetailUrl(deprovisionLoader.meta.opId));
  });

  return (
    <Td className="flex justify-end gap-2 mr-4">
      <Group variant="horizontal" size="sm">
        <ButtonDestroy
          size="sm"
          envId={metricDrain.environmentId}
          className="semibold"
          onClick={submitDeprovision}
          isLoading={deprovisionLoader.isLoading}
          variant="delete"
          requireConfirm
        >
          Delete
        </ButtonDestroy>
      </Group>
    </Td>
  );
};

const MetricDrainTable = ({ envId }: { envId: string }) => {
  useQuery(fetchEnvMetricDrains({ id: envId }));
  const metricDrains = useSelector((s) =>
    selectMetricDrainsByEnvId(s, { envId }),
  );
  const paginated = usePaginate(metricDrains);

  return (
    <Group>
      <Group size="sm">
        <FilterBar>
          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Metric Drains</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Status</Th>
          <Th>Handle</Th>
          <Th>Database</Th>
          <Th>Last Updated</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((drain) => (
            <Tr key={drain.id}>
              <MetricDrainPrimaryCell metricDrain={drain} />
              <MetricDrainHandleCell metricDrain={drain} />
              <MetricDrainDatabaseCell metricDrain={drain} />
              <MetricDrainLastUpdatedCell metricDrain={drain} />
              <MetricDrainActions metricDrain={drain} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const EnvironmentIntegrationsPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const onCreateMetrics = () => {
    navigate(createMetricDrainUrl(id));
  };
  const onCreateLogs = () => {
    navigate(createLogDrainUrl(id));
  };

  return (
    <Group>
      <Group variant="horizontal" size="sm">
        <ButtonOps envId={id} onClick={onCreateLogs}>
          <IconPlusCircle variant="sm" className="mr-1" /> New Log Drain
        </ButtonOps>
        <ButtonOps envId={id} onClick={onCreateMetrics}>
          <IconPlusCircle variant="sm" className="mr-1" /> New Metric Drain
        </ButtonOps>
      </Group>

      <LogDrainTable envId={id} />
      <MetricDrainTable envId={id} />
    </Group>
  );
};
