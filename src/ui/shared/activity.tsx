import { prettyDateTime } from "@app/date";
import {
  cancelAppOpsPoll,
  cancelDatabaseOpsPoll,
  cancelEndpointOpsPoll,
  cancelEnvOperationsPoll,
  cancelOrgOperationsPoll,
  fetchApp,
  fetchDatabase,
  fetchEnvironmentById,
  fetchServicesByAppId,
  getResourceUrl,
  pollAppOperations,
  pollDatabaseOperations,
  pollEndpointOperations,
  pollEnvOperations,
  pollOrgOperations,
  prettyResourceType,
  selectAppById,
  selectDatabaseById,
  selectEndpointById,
  selectServiceById,
} from "@app/deploy";
import { useLoader, useQuery, useSelector } from "@app/react";
import {
  appDetailUrl,
  databaseDetailUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type {
  DeployActivityRow,
  DeployOperation,
  ResourceType,
} from "@app/types";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  type PaginateProps,
  usePaginatedOpsByAppId,
  usePaginatedOpsByDatabaseId,
  usePaginatedOpsByEndpointId,
  usePaginatedOpsByEnvId,
  usePaginatedOpsByOrgId,
} from "../hooks";
import { usePoller } from "../hooks/use-poller";
import { Button } from "./button";
import { Group } from "./group";
import { IconInfo } from "./icons";
import { OpStatus } from "./operation-status";
import {
  DescBar,
  FilterBar,
  PaginateBar,
  TitleBar,
} from "./resource-list-view";
import { EnvStackCell } from "./resource-table";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "./table";
import { tokens } from "./tokens";
import { Tooltip } from "./tooltip";

interface OpCellProps {
  op: DeployActivityRow;
}

const getImageForResourceType = (resourceType: ResourceType) => {
  const imageToUse = `/resource-types/logo-${resourceType}.png`;
  if (
    ![
      "app",
      "backup",
      "certificates",
      "credentials",
      "database",
      "ephemeral_session",
      "image",
      "log_drain",
      "metric_drain",
      "plan",
      "service",
      "unknown",
      "vhost",
    ].includes(resourceType)
  ) {
    return null;
  }

  return (
    <img
      src={imageToUse}
      className="w-[32px] h-[32px] mr-2 mt-1 align-middle"
      aria-label={resourceType}
    />
  );
};

export const AppConfigureTooltip = ({ op }: { op: DeployOperation }) => {
  if (op.type !== "configure") return null;
  const text = Object.keys(op.env).join(", ");
  return (
    <Tooltip text={text}>
      <IconInfo variant="sm" />
    </Tooltip>
  );
};

const OpTypeCell = ({ op }: OpCellProps) => {
  return (
    <Td className="flex-1">
      <Group variant="horizontal" className="items-center" size="xs">
        <Link
          to={operationDetailUrl(op.id)}
          className={tokens.type["table link"]}
        >
          {capitalize(op.type)}
        </Link>
        <AppConfigureTooltip op={op} />
      </Group>
      <div>ID: {op.id}</div>
    </Td>
  );
};

const OpStatusCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <OpStatus status={op.status} />
    </Td>
  );
};

const OpResourceCell = ({ op }: OpCellProps) => {
  const url = getResourceUrl(op);
  return (
    <Td>
      <div className="flex">
        {getImageForResourceType(op.resourceType)}
        <div>
          {url ? (
            <Link to={url} className={tokens.type["table link"]}>
              {op.resourceHandle}
            </Link>
          ) : (
            <div>{op.resourceHandle}</div>
          )}
          <div>{prettyResourceType(op.resourceType)}</div>
        </div>
      </div>
    </Td>
  );
};

const OpServiceCell = ({ serviceId }: { serviceId: string }) => {
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const app = useSelector((s) => selectAppById(s, { id: service.appId }));
  const db = useSelector((s) =>
    selectDatabaseById(s, { id: service.databaseId }),
  );

  return (
    <Td>
      <Link
        className={tokens.type["table link"]}
        to={
          service.appId
            ? appDetailUrl(service.appId)
            : databaseDetailUrl(service.databaseId)
        }
      >
        {service.appId ? app.handle : db.handle}
      </Link>
    </Td>
  );
};

export const OpEndpointCell = ({ enpId }: { enpId: string }) => {
  const enp = useSelector((s) => selectEndpointById(s, { id: enpId }));
  return <OpServiceCell serviceId={enp.serviceId} />;
};

const OpParentResourceCell = ({ op }: OpCellProps) => {
  if (op.resourceType === "service") {
    return <OpServiceCell serviceId={op.resourceId} />;
  }

  if (op.resourceType === "vhost") {
    return <OpEndpointCell enpId={op.resourceId} />;
  }

  return <Td> </Td>;
};

const OpActionsCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <Link
        to={operationDetailUrl(op.id)}
        className="hover:no-underline flex justify-end mr-4"
      >
        <Button variant="primary" size="sm">
          Logs
        </Button>
      </Link>
    </Td>
  );
};

const OpLastUpdatedCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>{prettyDateTime(op.updatedAt)}</div>
    </Td>
  );
};

const OpUserCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>{op.userName}</div>
      {op.note ? <div>Note: {op.note}</div> : null}
    </Td>
  );
};

const OpListRow = ({ op }: OpCellProps) => {
  return (
    <Tr>
      <OpResourceCell op={op} />
      <OpStatusCell op={op} />
      <OpTypeCell op={op} />
      <OpParentResourceCell op={op} />
      <EnvStackCell environmentId={op.environmentId} />
      <OpUserCell op={op} />
      <OpLastUpdatedCell op={op} />
      <OpActionsCell op={op} />
    </Tr>
  );
};

function ActivityTable({
  paginated,
  showTitle = true,
  isLoading = false,
}: {
  paginated: PaginateProps<DeployActivityRow> & { isLoading: boolean };
  showTitle?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Group>
      <Group size="sm">
        <TitleBar
          visible={showTitle}
          description="This global Activity page show real-time changes to resources within the last 2 weeks."
        >
          Activity
        </TitleBar>

        <FilterBar>
          {showTitle ? null : (
            <DescBar>
              Operations show real-time changes to resources, such as Apps and
              Databases.
            </DescBar>
          )}

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Operations</DescBar>
            <PaginateBar
              {...paginated}
              isLoading={isLoading || paginated.isLoading}
            />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Resource</Th>
          <Th>Status</Th>
          <Th>Type</Th>
          <Th>Related To</Th>
          <Th>Environment</Th>
          <Th>User</Th>
          <Th>Last Updated</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={8} /> : null}
          {paginated.data.map((op) => (
            <OpListRow op={op} key={op.id} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}

export function ActivityByOrg({ orgId }: { orgId: string }) {
  const poller = useMemo(() => pollOrgOperations({ orgId }), [orgId]);
  const cancel = useMemo(() => cancelOrgOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });
  const loader = useLoader(pollOrgOperations);
  const paginated = usePaginatedOpsByOrgId(orgId);

  return (
    <ActivityTable
      paginated={paginated}
      isLoading={loader.isLoading}
      showTitle
    />
  );
}

export function ActivityByEnv({ envId }: { envId: string }) {
  useQuery(fetchEnvironmentById({ id: envId }));
  const poller = useMemo(() => pollEnvOperations({ envId }), [envId]);
  const cancel = useMemo(() => cancelEnvOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });
  const loader = useLoader(pollEnvOperations);
  const paginated = usePaginatedOpsByEnvId(envId);

  return (
    <ActivityTable
      paginated={paginated}
      isLoading={loader.isLoading}
      showTitle={false}
    />
  );
}

export function ActivityByApp({ appId }: { appId: string }) {
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const action = pollAppOperations({ id: app.id });
  useQuery(fetchEnvironmentById({ id: app.environmentId }));
  useQuery(fetchApp({ id: appId }));
  useQuery(fetchServicesByAppId({ id: appId }));

  const poller = useMemo(() => action, [app.id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });
  const loader = useLoader(action);
  const paginated = usePaginatedOpsByAppId(appId);

  return (
    <ActivityTable
      paginated={paginated}
      isLoading={loader.isLoading}
      showTitle={false}
    />
  );
}

export function ActivityByDatabase({ dbId }: { dbId: string }) {
  const action = pollDatabaseOperations({ id: dbId });
  const db = useSelector((s) => selectDatabaseById(s, { id: dbId }));
  useQuery(fetchEnvironmentById({ id: db.environmentId }));
  useQuery(fetchDatabase({ id: dbId }));

  const poller = useMemo(() => action, [dbId]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });
  const loader = useLoader(poller);
  const paginated = usePaginatedOpsByDatabaseId(dbId);

  return (
    <ActivityTable
      paginated={paginated}
      isLoading={loader.isLoading}
      showTitle={false}
    />
  );
}

export function ActivityByEndpoint({ enpId }: { enpId: string }) {
  const poller = useMemo(() => pollEndpointOperations({ id: enpId }), [enpId]);
  const cancel = useMemo(() => cancelEndpointOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });
  const loader = useLoader(pollEndpointOperations);
  const paginated = usePaginatedOpsByEndpointId(enpId);

  return (
    <ActivityTable
      paginated={paginated}
      isLoading={loader.isLoading}
      showTitle={false}
    />
  );
}
