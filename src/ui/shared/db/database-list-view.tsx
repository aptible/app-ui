import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { DeployDatabase, AppState } from "@app/types";
import { selectEnvironmentById, selectStackById } from "@app/deploy";

import {
	TableHead,
	Td,
	Button,
	tokens,
	ResourceListView,
	EnvironmentSelect,
	StackSelect,
	Input,
} from "../../shared";

const FilterBarView = () => {
	return (
		<div className="flex flex-1 pt-6 gap-3">
			<Input placeholder="Search Databases..." type="text" />
			<EnvironmentSelect />
			<StackSelect />
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
const DatabaseStatusChecksCell = () => {
	return (
		<Td className="2xl:flex-cell-md sm:flex-cell-sm">
			<div className={tokens.type.darker}>100%</div>
			<div className={tokens.type["normal lighter"]}>
				124 config checks &middot; 5m ago
			</div>
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

	const content = !stack ? (
		<span>Loading...</span>
	) : (
		<div>
			<div className={tokens.type.darker}>{env.handle}</div>
			<div className={tokens.type["normal lighter"]}>
				{stack.organizationId ? "Dedicated Stack " : "Shared Stack "}
				{stack.region}
			</div>
		</div>
	);

	return <Td className="2xl:flex-cell-md sm:flex-cell-sm">{content}</Td>;
};

/* const AppServicesCell = ({ database }: DatabaseCellProps) => {
  const { data: service, isLoading: serviceLoading } = useQuery(
    fetchService({ id: database.serviceId }),
    (s: AppState) => selectServiceById(s, { id: database.serviceId }),
  );

  const content =
    !service || serviceLoading ? (
      <span>Loading...</span>
    ) : (
      <>
        <div className={tokens.type['darker']}>Scale</div>
        <div className={tokens.type['normal lighter']}>
          {service.containerMemoryLimitMb / 1024} GB &middot;
          {database.disk && <>{database.disk.size} GB Disk</>}
        </div>
      </>
    );

  return <Td>{content}</Td>;
}; */

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
			<DatabaseStatusChecksCell />
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
				actions={[
					<Button type="button" variant="primary" onClick={() => {}}>
						Create Database
					</Button>,
				]}
				filterBar={<FilterBarView />}
				tableHeader={
					<TableHead
						headers={["Handle", "Status", "Environment", "Last Operation"]}
					/>
				}
				tableBody={body}
			/>
		</>
	);
};
