import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  DeployDatabaseRow,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchEnvironmentById,
  selectDatabasesForTableSearch,
  selectDatabasesForTableSearchByEnvironmentId,
} from "@app/deploy";
import type { AppState, DeployDatabase } from "@app/types";

import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { OpStatus } from "../op-status";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { databaseEndpointsUrl, operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";

type DatabaseCellProps = { database: DeployDatabase };

const DatabasePrimaryCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <Link to={databaseEndpointsUrl(database.id)} className="flex">
          <img
            src={`/database-types/logo-${database.type}.png`}
            className="w-8 h-8 mt-1 mr-2"
            aria-label={`${database.type} Database`}
          />
          <p className="leading-4">
            <span className={tokens.type["table link"]}>{database.handle}</span>
            <br />
            <span className={tokens.type["normal lighter"]}>
              {capitalize(database.type)}
            </span>
          </p>
        </Link>
      </div>
    </Td>
  );
};

const LastOpCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {database.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <Link
              to={operationDetailUrl(database.lastOperation.id)}
              className={tokens.type["table link"]}
            >
              {capitalize(database.lastOperation.type)} by{" "}
              {database.lastOperation.userName}
            </Link>
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <OpStatus status={database.lastOperation.status} />{" "}
            {prettyDateRelative(database.lastOperation.createdAt)}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>No activity</div>
      )}
    </Td>
  );
};

const DbsResourceHeaderTitleBar = ({
  dbs,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
}: {
  dbs: DeployDatabaseRow[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      if (!onChange) {
        return null;
      }
      return (
        <ResourceHeader
          title="Databases"
          filterBar={
            <div className="pt-1">
              <InputSearch
                placeholder="Search databases..."
                search={search}
                onChange={onChange}
              />
              <p className="flex text-gray-500 mt-4 text-base">
                {dbs.length} Database{dbs.length !== 1 && "s"}
              </p>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base">
          {dbs.length} Database{dbs.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

export function DatabaseListByOrg({
  resourceHeaderType = "title-bar",
}: {
  environmentId?: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
}) {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, {
      search,
    }),
  );

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const headers = ["Handle", "Environment", "Last Operation"];

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={headers}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              resourceHeaderType={resourceHeaderType}
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
            resourceHeaderType={resourceHeaderType}
            search={search}
            onChange={onChange}
          />
        }
        tableHeader={<TableHead headers={headers} />}
        tableBody={
          <>
            {dbs.map((db) => (
              <tr key={db.id}>
                <DatabasePrimaryCell database={db} />
                <EnvStackCell environmentId={db.environmentId} />
                <LastOpCell database={db} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
}

export const DatabaseListByEnvironment = ({
  environmentId,
  resourceHeaderType = "title-bar",
  search = "",
}: {
  environmentId: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
}) => {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search,
    }),
  );

  const headers = ["Handle", "Environment", "Last Operation"];

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={headers}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              search={search}
              resourceHeaderType={resourceHeaderType}
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
            search={search}
            resourceHeaderType={resourceHeaderType}
          />
        }
        tableHeader={<TableHead headers={headers} />}
        tableBody={
          <>
            {dbs.map((db) => (
              <tr key={db.id}>
                <DatabasePrimaryCell database={db} />
                <EnvStackCell environmentId={db.environmentId} />
                <LastOpCell database={db} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};
