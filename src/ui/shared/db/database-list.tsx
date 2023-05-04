import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  fetchAllDatabases,
  fetchAllEnvironments,
  selectDatabasesForTableSearch,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";
import type { AppState, DeployDatabase } from "@app/types";

import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { databaseEndpointsUrl } from "@app/routes";

type DatabaseCellProps = { database: DeployDatabase };

const DatabasePrimaryCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={databaseEndpointsUrl(database.id)}>
        <div className={tokens.type["medium label"]}>{database.handle}</div>
        <div className={tokens.type["normal lighter"]}>{database.type}</div>
      </Link>
    </Td>
  );
};

const DatabaseStackCell = ({ database }: DatabaseCellProps) => {
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: env.stackId }),
  );

  const content = stack ? (
    <div>
      <div className={tokens.type.darker}>{env.handle}</div>
      <div className={tokens.type["normal lighter"]}>
        {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}
        {stack.region}
      </div>
    </div>
  ) : (
    <span>Loading...</span>
  );

  return <Td className="2xl:flex-cell-md sm:flex-cell-sm">{content}</Td>;
};

const LastOpCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {database.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <span className="font-semibold">
              {database.lastOperation.type.toLocaleUpperCase()}
            </span>{" "}
            by {database.lastOperation.userName}
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <span className="font-semibold">
              {database.lastOperation.status.toLocaleUpperCase()}
            </span>{" "}
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
      <DatabaseStackCell database={database} />
      <LastOpCell database={database} />
    </tr>
  );
};

export function DatabaseList({
  resourceHeaderType = "title-bar",
  skipDescription = false,
  searchOverride = "",
}: {
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
  searchOverride?: string;
}) {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, {
      search: searchOverride ? searchOverride : search,
    }),
  );

  const description = "Databases provide data persistency on Aptible.";

  const resourceHeaderTitleBar = () => {
    switch (resourceHeaderType) {
      case "hidden":
        return undefined;
      case "title-bar":
        return (
          <ResourceHeader
            title="Databases"
            description={skipDescription ? undefined : description}
            filterBar={
              searchOverride ? undefined : (
                <InputSearch
                  placeholder="Search databases ..."
                  search={search}
                  onChange={onChange}
                />
              )
            }
          />
        );
      case "simple-text":
        return (
          <p className="flex ml-4 text-gray-500 text-base">
            {dbs.length} Database{dbs.length > 1 && "s"}
          </p>
        );
      default:
        return undefined;
    }
  };

  return (
    <LoadResources query={query} isEmpty={dbs.length === 0 && search === ""}>
      <ResourceListView
        header={resourceHeaderTitleBar()}
        tableHeader={
          <TableHead headers={["Handle", "Environment", "Last Operation"]} />
        }
        tableBody={
          <>
            {dbs.map((database) => (
              <DatabaseListRow database={database} key={database.id} />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}
