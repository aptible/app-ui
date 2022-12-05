import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { DeployDatabase, AppState } from "@app/types";
import {
  fetchAllDatabases,
  fetchAllEnvironments,
  selectDatabasesForTableSearch,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";

import {
  TableHead,
  Td,
  tokens,
  ResourceListView,
  Input,
  LoadResources,
} from "../../shared";
import { useQuery } from "saga-query/react";
import { useState } from "react";
import { prettyDateRelative } from "@app/date";
import { MagnifyingGlass } from "@app/ui/shared/icons";

const FilterBarView = () => {
  return (
    <div className="flex flex-1 pt-6 gap-3">
      <Input placeholder="Search Databases..." type="text" />
    </div>
  );
};

type DatabaseCellProps = { database: DeployDatabase };

const DatabasePrimaryCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={`/databases/${database.id}`}>
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
            <strong>{database.lastOperation.type.toLocaleUpperCase()}</strong>{" "}
            by {database.lastOperation.userName}
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <strong>
              {database.lastOperation.status.toLocaleUpperCase()}
            </strong>{" "}
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

export function DatabaseList() {
  const query = useQuery(fetchAllDatabases());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, { search }),
  );

  return (
    <LoadResources query={query} isEmpty={dbs.length === 0 && search === ""}>
      <ResourceListView
        title="Databases"
        description="Databases provide data persistency on Aptible."
        filterBar={
          <div
            className="flex flex-1 pt-6 gap-3"
            style={{ position: "relative", margin: "5px" }}
          >
            <MagnifyingGlass
              style={{
                position: "absolute",
                display: "inline-block",
                top: "30",
                left: "6",
              }}
            />
            <Input
              placeholder="Search Databases ..."
              type="text"
              value={search}
              onChange={onChange}
              className="search-bar pl-8"
            />
          </div>
        }
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
