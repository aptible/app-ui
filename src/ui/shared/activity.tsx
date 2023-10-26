import { prettyEnglishDateWithTime } from "@app/date";
import {
  cancelAppOpsPoll,
  cancelDatabaseOpsPoll,
  cancelEndpointOpsPoll,
  cancelEnvOperationsPoll,
  cancelOrgOperationsPoll,
  fetchApp,
  fetchDatabase,
  fetchEnvironmentById,
  fetchOrgOperations,
  fetchServiceOperations,
  getResourceUrl,
  pollAppOperations,
  pollDatabaseOperations,
  pollEndpointOperations,
  pollEnvOperations,
  pollOrgOperations,
  prettyResourceType,
  selectActivityForTableSearch,
  selectAppById,
  selectDatabaseById,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import { operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployActivityRow, ResourceType } from "@app/types";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks";
import { usePoller } from "../hooks/use-poller";
import { Button } from "./button";
import { Group } from "./group";
import { InputSearch } from "./input";
import { LoadingSpinner } from "./loading";
import { OpStatus } from "./op-status";
import {
  DescBar,
  FilterBar,
  PaginateBar,
  TitleBar,
} from "./resource-list-view";
import { EnvStackCell } from "./resource-table";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "./table";
import { tokens } from "./tokens";

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

const OpTypeCell = ({ op }: OpCellProps) => {
  return (
    <Td className="flex-1">
      <Link
        to={operationDetailUrl(op.id)}
        className={tokens.type["table link"]}
      >
        {capitalize(op.type)}
      </Link>
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
      <div>{capitalize(prettyEnglishDateWithTime(op.updatedAt))}</div>
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
      <EnvStackCell environmentId={op.environmentId} />
      <OpUserCell op={op} />
      <OpLastUpdatedCell op={op} />
      <OpActionsCell op={op} />
    </Tr>
  );
};

function ActivityTable({
  ops,
  search,
  onChange,
  showTitle = true,
  isLoading = false,
}: {
  ops: DeployActivityRow[];
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showTitle?: boolean;
  isLoading?: boolean;
}) {
  const paginated = usePaginate(ops);
  return (
    <Group>
      <Group size="sm">
        <TitleBar
          visible={showTitle}
          description="Operations show real-time changes to resources, such as Apps and Databases."
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

          <Group variant="horizontal" size="sm">
            <InputSearch
              placeholder="Search ..."
              search={search}
              onChange={onChange}
            />
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : null}
          </Group>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Operations</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Resource</Th>
          <Th>Status</Th>
          <Th>Type</Th>
          <Th>Environment</Th>
          <Th>User</Th>
          <Th>Last Updated</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
          {paginated.data.map((op) => (
            <OpListRow op={op} key={op.id} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}

export function ActivityByOrg({ orgId }: { orgId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollOrgOperations);
  useQuery(fetchOrgOperations({ orgId }));

  const poller = useMemo(() => pollOrgOperations({ orgId }), [orgId]);
  const cancel = useMemo(() => cancelOrgOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
    }),
  );

  return (
    <ActivityTable
      ops={ops}
      onChange={onChange}
      isLoading={loader.isLoading}
      search={search}
      showTitle
    />
  );
}

export function ActivityByEnv({ envId }: { envId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollEnvOperations);
  useQuery(fetchEnvironmentById({ id: envId }));

  const poller = useMemo(() => pollEnvOperations({ envId }), [envId]);
  const cancel = useMemo(() => cancelEnvOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      envId,
    }),
  );

  return (
    <ActivityTable
      ops={ops}
      onChange={onChange}
      isLoading={loader.isLoading}
      search={search}
      showTitle={false}
    />
  );
}

export function ActivityByApp({ appId }: { appId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollAppOperations);
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  useQuery(fetchEnvironmentById({ id: app.environmentId }));
  useQuery(fetchApp({ id: appId }));

  const poller = useMemo(() => pollAppOperations({ id: app.id }), [app.id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });

  const resourceIds = useMemo(() => [appId], [appId]);
  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceIds,
    }),
  );

  return (
    <ActivityTable
      ops={ops}
      onChange={onChange}
      isLoading={loader.isLoading}
      search={search}
      showTitle={false}
    />
  );
}

export function ActivityByDatabase({ dbId }: { dbId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollDatabaseOperations);
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id: dbId }));
  useQuery(fetchEnvironmentById({ id: db.environmentId }));
  useQuery(fetchDatabase({ id: dbId }));
  useQuery(fetchServiceOperations({ id: db.serviceId }));

  const poller = useMemo(() => pollDatabaseOperations({ id: dbId }), [dbId]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });

  const resourceIds = useMemo(
    () => [dbId, db.serviceId].filter(Boolean),
    [dbId, db.serviceId],
  );
  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceIds,
    }),
  );

  return (
    <ActivityTable
      ops={ops}
      onChange={onChange}
      isLoading={loader.isLoading}
      search={search}
      showTitle={false}
    />
  );
}

export function ActivityByEndpoint({ enpId }: { enpId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollEndpointOperations);

  const poller = useMemo(() => pollEndpointOperations({ id: enpId }), [enpId]);
  const cancel = useMemo(() => cancelEndpointOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });

  const resourceIds = useMemo(() => [enpId], [enpId]);
  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceIds,
    }),
  );

  return (
    <ActivityTable
      ops={ops}
      onChange={onChange}
      isLoading={loader.isLoading}
      search={search}
      showTitle={false}
    />
  );
}
