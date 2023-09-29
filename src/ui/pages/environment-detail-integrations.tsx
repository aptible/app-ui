import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import { prettyDateRelative } from "@app/date";
import {
  deprovisionLogDrain,
  deprovisionMetricDrain,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  restartLogDrain,
  restartMetricDrain,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
} from "@app/deploy";
import {
  createLogDrainUrl,
  createMetricDrainUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployLogDrain, DeployMetricDrain } from "@app/types";

import {
  ButtonDestroy,
  ButtonOps,
  EmptyResourcesTable,
  Group,
  IconPlusCircle,
  LoadResources,
  Pill,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";

const DrainStatusPill = ({
  drain,
}: { drain: DeployLogDrain | DeployMetricDrain }) => {
  let pillClass = pillStyles.progress;
  if (
    drain.status === "pending" ||
    drain.status === "provisioning" ||
    drain.status === "deprovisioning"
  ) {
    pillClass = pillStyles.pending;
  }
  if (drain.status === "provisioned") {
    pillClass = pillStyles.success;
  }
  if (
    drain.status === "deprovision_failed" ||
    drain.status === "provision_failed"
  ) {
    pillClass = pillStyles.error;
  }

  return <Pill className={pillClass}>{capitalize(drain.status)}</Pill>;
};

const LogDrainPrimaryCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <DrainStatusPill drain={logDrain} />
        </p>
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
            {capitalize(prettyDateRelative(logDrain.updatedAt))}
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

const logDrainsHeaders = [
  "Status",
  "Handle",
  "Sources",
  "Last Updated",
  "Actions",
];

const LogDrainsSection = ({ id }: { id: string }) => {
  const query = useQuery(fetchEnvLogDrains({ id }));

  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={logDrainsHeaders}
          titleBar={
            <p className="flex text-gray-500 text-base mb-4">
              {logDrains.length} Log Drain{logDrains.length !== 1 && "s"}
            </p>
          }
        />
      }
      query={query}
      isEmpty={logDrains.length === 0}
    >
      <ResourceListView
        header={
          <p className="flex text-gray-500 text-base mb-4">
            {logDrains.length} Log Drain{logDrains.length !== 1 && "s"}
          </p>
        }
        tableHeader={
          <TableHead rightAlignedFinalCol headers={logDrainsHeaders} />
        }
        tableBody={
          <>
            {logDrains.map((logDrain) => (
              <tr className="group hover:bg-gray-50" key={logDrain.id}>
                <LogDrainPrimaryCell logDrain={logDrain} />
                <LogDrainHandleCell logDrain={logDrain} />
                <LogDrainSourcesCell logDrain={logDrain} />
                <LogDrainLastUpdatedCell logDrain={logDrain} />
                <LogDrainActions logDrain={logDrain} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};

const MetricDrainPrimaryCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <DrainStatusPill drain={metricDrain} />
        </p>
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

const MetricDrainLastUpdatedCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {capitalize(prettyDateRelative(metricDrain.updatedAt))}
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

  const restartAction = restartMetricDrain({ id: metricDrain.id });
  const restartLoader = useLoader(restartAction);
  const submitRestart = () => {
    dispatch(restartAction);
  };
  useLoaderSuccess(restartLoader, () => {
    navigate(operationDetailUrl(restartLoader.meta.opId));
  });

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
        <ButtonOps
          size="sm"
          envId={metricDrain.environmentId}
          className="semibold"
          onClick={submitRestart}
          isLoading={restartLoader.isLoading}
        >
          Restart
        </ButtonOps>

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

const metricDrainsHeaders = ["Status", "Handle", "Last Updated", "Actions"];

const MetricDrainsSection = ({ id }: { id: string }) => {
  const query = useQuery(fetchEnvMetricDrains({ id }));

  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: id }),
  );

  return (
    <div className="mb-4">
      <LoadResources
        empty={
          <EmptyResourcesTable
            headers={metricDrainsHeaders}
            titleBar={
              <p className="flex text-gray-500 text-base my-4">
                {metricDrains.length} Metric Drain
                {metricDrains.length !== 1 && "s"}
              </p>
            }
          />
        }
        query={query}
        isEmpty={metricDrains.length === 0}
      >
        <ResourceListView
          header={
            <p className="flex text-gray-500 text-base my-4">
              {metricDrains.length} Metric Drain
              {metricDrains.length !== 1 && "s"}
            </p>
          }
          tableHeader={
            <TableHead rightAlignedFinalCol headers={metricDrainsHeaders} />
          }
          tableBody={
            <>
              {metricDrains.map((metricDrain) => (
                <tr className="group hover:bg-gray-50" key={metricDrain.id}>
                  <MetricDrainPrimaryCell metricDrain={metricDrain} />
                  <MetricDrainHandleCell metricDrain={metricDrain} />
                  <MetricDrainLastUpdatedCell metricDrain={metricDrain} />
                  <MetricDrainActions metricDrain={metricDrain} />
                </tr>
              ))}
            </>
          }
        />
      </LoadResources>
    </div>
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
    <div>
      <Group variant="horizontal" size="sm" className="mb-4">
        <ButtonOps envId={id} onClick={onCreateLogs}>
          <IconPlusCircle variant="sm" className="mr-1" /> New Log Drain
        </ButtonOps>
        <ButtonOps envId={id} onClick={onCreateMetrics}>
          <IconPlusCircle variant="sm" className="mr-1" /> New Metric Drain
        </ButtonOps>
      </Group>

      <LogDrainsSection id={id} />
      <MetricDrainsSection id={id} />
    </div>
  );
};
