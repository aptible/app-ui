import { useLoader, useQuery } from "@app/fx";
import { ReactElement, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Tooltip } from "./tooltip";

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
import { operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployActivityRow, ResourceType } from "@app/types";

import { usePoller } from "../hooks/use-poller";
import { Button } from "./button";
import { IconInfo } from "./icons";
import { InputSearch } from "./input";
import { LoadResources } from "./load-resources";
import { LoadingSpinner } from "./loading";
import { OpStatus } from "./op-status";
import { ResourceHeader, ResourceListView } from "./resource-list-view";
import { EnvStackCell } from "./resource-table";
import { TableHead, Td } from "./table";
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
    <tr className="group hover:bg-gray-50">
      <OpResourceCell op={op} />
      <OpStatusCell op={op} />
      <OpTypeCell op={op} />
      <EnvStackCell environmentId={op.environmentId} />
      <OpUserCell op={op} />
      <OpLastUpdatedCell op={op} />
      <OpActionsCell op={op} />
    </tr>
  );
};

function ActivityTable({
  ops,
  search,
  isLoading,
  onChange,
  title = "",
  description = "",
}: {
  ops: DeployActivityRow[];
  search: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  description?: string;
}) {
  const resourceHeaderTitleBar = (): ReactElement | undefined => {
    return (
      <ResourceHeader
        title={title}
        description={description}
        filterBar={
          <div>
            <div className="flex items-center gap-3">
              <InputSearch
                placeholder="Search operations..."
                search={search}
                onChange={onChange}
              />
              {isLoading ? <LoadingSpinner /> : null}
            </div>
            <div className="flex">
              <p className="flex text-gray-500 mt-4 text-base">
                {ops.length} Operation{ops.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-4">
                <Tooltip
                  fluid
                  text="Operations show real-time changes to resources, such as Apps and Databases."
                >
                  <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                </Tooltip>
              </div>
            </div>
          </div>
        }
      />
    );
  };

  return (
    <ResourceListView
      header={resourceHeaderTitleBar()}
      tableHeader={
        <TableHead
          rightAlignedFinalCol
          headers={[
            "Resource",
            "Status",
            "Operation Type",
            "Environment",
            "User",
            "Last Updated",
            "Actions",
          ]}
        />
      }
      tableBody={
        <>
          {ops.map((op) => (
            <OpListRow op={op} key={op.id} />
          ))}
        </>
      }
    />
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
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
        title="Activity"
      />
    </LoadResources>
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
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
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
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
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
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
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
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
  );
}
