import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { DeployDatabase, AppState } from "@app/types";
import { selectEnvironmentById, selectStackById } from "@app/deploy";

import { TableHead, Td, tokens, ResourceListView, Input } from "../../shared";

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

const LastOperationCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {database.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            {database.lastOperation.userName}
          </div>
          <div className={tokens.type["normal lighter"]}>
            {database.lastOperation.type}
            &middot;
            {database.lastOperation.status}
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
      <LastOperationCell database={database} />
    </tr>
  );
};

export const DatabaseListView = ({
  databases,
}: {
  databases: DeployDatabase[];
}) => {
  const body = (
    <>
      {databases.map((database) => (
        <DatabaseListRow database={database} key={database.id} />
      ))}
    </>
  );

  return (
    <>
      <ResourceListView
        title="Databases"
        description="Databases provide data persistency on Aptible."
        filterBar={<FilterBarView />}
        tableHeader={
          <TableHead headers={["Handle", "Environment", "Last Operation"]} />
        }
        tableBody={body}
      />
    </>
  );
};
