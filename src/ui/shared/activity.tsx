import { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { batchActions } from "saga-query";
import { useLoader, useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  DeployActivityRow,
  cancelAppOpsPoll,
  cancelDatabaseOpsPoll,
  cancelEnvOperationsPoll,
  cancelOrgOperationsPoll,
  fetchAllApps,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchApp,
  fetchDatabase,
  fetchEnvironmentById,
  getResourceUrl,
  pollAppOperations,
  pollDatabaseOperations,
  pollEnvOperations,
  pollOrgOperations,
  selectActivityForTableSearch,
  selectAppById,
  selectDatabaseById,
} from "@app/deploy";
import { environmentDetailUrl, operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { Action, AppState } from "@app/types";

import { InputSearch } from "./input";
import { LoadResources } from "./load-resources";
import { Loading } from "./loading";
import { OpStatus } from "./op-status";
import { ResourceHeader, ResourceListView } from "./resource-list-view";
import { TableHead, Td } from "./table";
import { tokens } from "./tokens";

interface OpCellProps {
  op: DeployActivityRow;
}

const OpPrimaryCell = ({ op }: OpCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={operationDetailUrl(op.id)}>
        <div className={tokens.type["medium label"]}>{capitalize(op.type)}</div>
      </Link>
    </Td>
  );
};

const OpEnvCell = ({ op }: OpCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={environmentDetailUrl(op.environmentId)}>{op.envHandle}</Link>
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

const OpResourceTypeCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>{capitalize(op.resourceType)}</div>
    </Td>
  );
};

const OpResourceHandleCell = ({ op }: OpCellProps) => {
  const url = getResourceUrl(op);
  return (
    <Td>
      {url ? (
        <Link to={url}>{op.resourceHandle}</Link>
      ) : (
        <div>{op.resourceHandle}</div>
      )}
    </Td>
  );
};

const OpLastUpdatedCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>{capitalize(prettyDateRelative(op.updatedAt))}</div>
    </Td>
  );
};

const OpUserCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <a href={`mailto:${op.userEmail}`}>{op.userName}</a>
    </Td>
  );
};

const OpListRow = ({ op }: OpCellProps) => {
  return (
    <tr>
      <OpPrimaryCell op={op} />
      <OpStatusCell op={op} />
      <OpEnvCell op={op} />
      <OpResourceTypeCell op={op} />
      <OpResourceHandleCell op={op} />
      <OpUserCell op={op} />
      <OpLastUpdatedCell op={op} />
    </tr>
  );
};

function ActivityTable({
  ops,
  search,
  isLoading,
  onChange,
  hideActivityTitle = false,
}: {
  ops: DeployActivityRow[];
  search: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideActivityTitle?: boolean;
}) {
  const resourceHeaderTitleBar = (): ReactElement | undefined => {
    return (
      <ResourceHeader
        title={hideActivityTitle ? "" : "Activity"}
        filterBar={
          <div className="flex items-center gap-3">
            <InputSearch
              placeholder="Search Operations..."
              search={search}
              onChange={onChange}
            />
            {isLoading ? <Loading text="Refreshing ..." /> : null}
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
          headers={[
            "Type",
            "Status",
            "Environment",
            "Resource Type",
            "Resource",
            "User",
            "Last Updated",
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

const usePoller = ({ action, cancel }: { action: Action; cancel: Action }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(batchActions([cancel, action]));
    return () => {
      dispatch(cancel);
    };
  }, [action, cancel]);
};

export function ActivityByOrg({ orgId }: { orgId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollOrgOperations);
  useQuery(fetchAllEnvironments());
  useQuery(fetchAllApps());
  useQuery(fetchAllDatabases());

  const poller = useMemo(() => pollOrgOperations({ orgId }), [orgId]);
  const cancel = useMemo(() => cancelOrgOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

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
      />
    </LoadResources>
  );
}

export function ActivityByEnv({ envId }: { envId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollEnvOperations);
  useQuery(fetchEnvironmentById({ id: envId }));
  useQuery(fetchAllApps());
  useQuery(fetchAllDatabases());

  const poller = useMemo(() => pollEnvOperations({ envId }), [envId]);
  const cancel = useMemo(() => cancelEnvOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

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
        hideActivityTitle
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

  const poller = useMemo(() => pollAppOperations({ id: appId }), [appId]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceId: appId,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
        hideActivityTitle
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

  const poller = useMemo(() => pollDatabaseOperations({ id: dbId }), [dbId]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceId: dbId,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
        hideActivityTitle
      />
    </LoadResources>
  );
}
