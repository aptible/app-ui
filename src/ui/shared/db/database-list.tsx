import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconInfo, IconPlusCircle } from "../icons";
import { Tooltip } from "../tooltip";

import { prettyDateRelative } from "@app/date";
import {
  DeployDatabaseRow,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchEnvironmentById,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  selectDatabasesForTableSearch,
  selectDatabasesForTableSearchByEnvironmentId,
  selectDiskById,
  selectLatestOpByDatabaseId,
  selectServiceById,
} from "@app/deploy";
import type { AppState, DeployDatabase } from "@app/types";

import {
  databaseDetailUrl,
  databaseScaleUrl,
  environmentCreateDbUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import { ActionListView } from "../action-list-view";
import { Button, ButtonCreate } from "../button";
import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { OpStatus } from "../op-status";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

type DatabaseCellProps = { database: DeployDatabase };

export const DatabaseItemView = ({
  database,
}: { database: DeployDatabase }) => {
  return (
    <div className="flex">
      <Link to={databaseDetailUrl(database.id)} className="flex">
        <img
          src={`/database-types/logo-${database.type}.png`}
          className="w-8 h-8 mr-2 mt-2 align-middle"
          aria-label={`${database.type} Database`}
        />
        <p className="flex flex-col">
          <span className={tokens.type["table link"]}>{database.handle}</span>
          <span className={tokens.type["normal lighter"]}>
            {capitalize(database.type)}
          </span>
        </p>
      </Link>
    </div>
  );
};

const DatabasePrimaryCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="flex-1">
      <DatabaseItemView database={database} />
    </Td>
  );
};

const DatabaseCostCell = ({ database }: DatabaseCellProps) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const disk = useSelector((s: AppState) =>
    selectDiskById(s, { id: database.id }),
  );
  const currentContainerProfile = getContainerProfileFromType(
    service.instanceClass,
  );
  const { pricePerMonth: currentPrice } = hourlyAndMonthlyCostsForContainers(
    service.containerCount,
    currentContainerProfile,
    service.containerMemoryLimitMb,
    disk.size,
  );
  return (
    <Td>
      <div className={tokens.type.darker}>${currentPrice}</div>
    </Td>
  );
};

const LastOpCell = ({ database }: DatabaseCellProps) => {
  const lastOperation = useSelector((s: AppState) =>
    selectLatestOpByDatabaseId(s, { dbId: database.id }),
  );
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <Link
              to={operationDetailUrl(lastOperation.id)}
              className={tokens.type["table link"]}
            >
              {capitalize(lastOperation.type)} by {lastOperation.userName}
            </Link>
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <OpStatus status={lastOperation.status} />{" "}
            {prettyDateRelative(lastOperation.createdAt)}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>No activity</div>
      )}
    </Td>
  );
};

const DatabaseActionsCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td>
      <Link
        to={databaseScaleUrl(database.id)}
        className="hover:no-underline flex justify-end mr-4"
      >
        <Button variant="primary" size="sm">
          Scale
        </Button>
      </Link>
    </Td>
  );
};

type HeaderTypes =
  | {
      resourceHeaderType: "title-bar";
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | { resourceHeaderType: "simple-text"; onChange?: null };

const DbsResourceHeaderTitleBar = ({
  dbs,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
  actions = [],
}: {
  dbs: DeployDatabaseRow[];
  search?: string;
  actions?: JSX.Element[];
} & HeaderTypes) => {
  switch (resourceHeaderType) {
    case "title-bar":
      if (!onChange) {
        return null;
      }
      return (
        <ResourceHeader
          title="Databases"
          actions={actions}
          filterBar={
            <div>
              <InputSearch
                placeholder="Search databases..."
                search={search}
                onChange={onChange}
              />
              <div className="flex">
                <p className="flex text-gray-500 mt-4 text-base">
                  {dbs.length} Database{dbs.length !== 1 && "s"}
                </p>
                <div className="mt-4">
                  <Tooltip
                    fluid
                    text="Databases provide data persistence and are automatically configured and managed."
                  >
                    <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <div className="flex flex-col flex-col-reverse gap-4 text-gray-500 text-base mb-4">
          <div>
            {dbs.length} Database{dbs.length !== 1 && "s"}
          </div>
          <div>
            {actions.length > 0 ? <ActionListView actions={actions} /> : null}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const DatabaseListByOrg = () => {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchAllEnvironments());

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };
  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, {
      search,
    }),
  );

  const headers = [
    "Handle",
    "Environment",
    "Est. Monthly Cost",
    "Last Operation",
    "Actions",
  ];

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={headers}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              resourceHeaderType="title-bar"
              search={search}
              onChange={onChange}
            />
          }
        />
      }
      query={query}
      isEmpty={dbs.length === 0 && search === ""}
    >
      <ResourceListView
        header={
          <DbsResourceHeaderTitleBar
            dbs={dbs}
            resourceHeaderType="title-bar"
            search={search}
            onChange={onChange}
          />
        }
        tableHeader={<TableHead rightAlignedFinalCol headers={headers} />}
        tableBody={
          <>
            {dbs.map((db) => (
              <tr className="group hover:bg-gray-50" key={db.id}>
                <DatabasePrimaryCell database={db} />
                <EnvStackCell environmentId={db.environmentId} />
                <DatabaseCostCell database={db} />
                <LastOpCell database={db} />
                <DatabaseActionsCell database={db} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};

export const DatabaseListByEnvironment = ({
  environmentId,
}: {
  environmentId: string;
}) => {
  const navigate = useNavigate();
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const onCreate = () => {
    navigate(environmentCreateDbUrl(environmentId));
  };

  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search: "",
    }),
  );

  const headers = [
    "Handle",
    "Environment",
    "Est. Monthly Cost",
    "Last Operation",
    "Actions",
  ];
  const actions = [
    <ButtonCreate envId={environmentId} onClick={onCreate}>
      <IconPlusCircle variant="sm" />
      <div className="ml-2">New Database</div>
    </ButtonCreate>,
  ];

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={headers}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              resourceHeaderType="simple-text"
              actions={actions}
            />
          }
        />
      }
      query={query}
      isEmpty={dbs.length === 0}
    >
      <ResourceListView
        header={
          <DbsResourceHeaderTitleBar
            actions={actions}
            dbs={dbs}
            resourceHeaderType="simple-text"
          />
        }
        tableHeader={<TableHead rightAlignedFinalCol headers={headers} />}
        tableBody={
          <>
            {dbs.map((db) => (
              <tr className="group hover:bg-gray-50" key={db.id}>
                <DatabasePrimaryCell database={db} />
                <EnvStackCell environmentId={db.environmentId} />
                <DatabaseCostCell database={db} />
                <LastOpCell database={db} />
                <DatabaseActionsCell database={db} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};
