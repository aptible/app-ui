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
            src={`/logo-${database.type}.png`}
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

const DatabaseListRow = ({ database }: { database: DeployDatabase }) => {
  return (
    <tr>
      <DatabasePrimaryCell database={database} />
      <EnvStackCell environmentId={database.environmentId} />
      <LastOpCell database={database} />
    </tr>
  );
};

const dbHeaders = ["Handle", "Environment", "Last Operation"];

const DatabaseList = ({
  dbs,
  headerTitleBar,
}: {
  dbs: DeployDatabaseRow[];
  headerTitleBar: React.ReactNode;
}) => {
  return (
    <ResourceListView
      header={headerTitleBar}
      tableHeader={<TableHead headers={dbHeaders} />}
      tableBody={
        <>
          {dbs.map((db) => (
            <DatabaseListRow database={db} key={db.id} />
          ))}
        </>
      }
    />
  );
};

const DbsResourceHeaderTitleBar = ({
  dbs,
  resourceHeaderType = "title-bar",
  search = "",
  searchOverride = "",
  onChange,
}: {
  dbs: DeployDatabaseRow[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  searchOverride?: string;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      return (
        <ResourceHeader
          title="Apps"
          filterBar={
            searchOverride ? undefined : (
              <InputSearch
                placeholder="Search databases..."
                search={search}
                onChange={onChange}
              />
            )
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
  searchOverride = "",
}: {
  environmentId?: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
  searchOverride?: string;
}) {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, {
      search: searchOverride ? searchOverride : search,
    }),
  );

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={dbHeaders}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              searchOverride={searchOverride}
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
      <DatabaseList
        dbs={dbs}
        headerTitleBar={
          <DbsResourceHeaderTitleBar
            dbs={dbs}
            searchOverride={searchOverride}
            resourceHeaderType={resourceHeaderType}
            search={search}
            onChange={onChange}
          />
        }
      />
    </LoadResources>
  );
}

export const DatabaseListByEnvironment = ({
  environmentId,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
}: {
  environmentId: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
  search?: string;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search,
    }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={dbHeaders}
          titleBar={
            <DbsResourceHeaderTitleBar
              dbs={dbs}
              searchOverride={search}
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
      <DatabaseList
        dbs={dbs}
        headerTitleBar={
          <DbsResourceHeaderTitleBar
            dbs={dbs}
            searchOverride={search}
            resourceHeaderType={resourceHeaderType}
            search={search}
            onChange={onChange}
          />
        }
      />
    </LoadResources>
  );
};
