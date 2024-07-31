import { prettyDateTime } from "@app/date";
import {
  type DatabaseDependency,
  type DeployDatabaseRow,
  calcMetrics,
  calculateCost,
  fetchDatabaseImages,
  fetchDatabases,
  fetchEnvironmentById,
  fetchEnvironments,
  selectDatabaseImageById,
  selectDatabasesForTableSearch,
  selectDatabasesForTableSearchByEnvironmentId,
  selectDiskById,
  selectLatestOpByDatabaseId,
  selectServiceById,
} from "@app/deploy";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import {
  createDbUrl,
  databaseDetailUrl,
  databaseScaleUrl,
  environmentCreateDbUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { DeployDatabase } from "@app/types";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { usePaginate } from "../../hooks";
import { Button, ButtonCreate, ButtonLink } from "../button";
import { Code } from "../code";
import { Group } from "../group";
import { IconChevronDown, IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import { OpStatus } from "../operation-status";
import {
  ActionBar,
  DescBar,
  FilterBar,
  LoadingBar,
  PaginateBar,
  TitleBar,
} from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";
import { Tooltip } from "../tooltip";

interface DatabaseCellProps {
  database: DeployDatabase;
}

export const DatabaseItemView = ({
  database,
}: { database: DeployDatabase }) => {
  const image = useSelector((s) =>
    selectDatabaseImageById(s, { id: database.databaseImageId }),
  );
  return (
    <div className="flex">
      <Link to={databaseDetailUrl(database.id)} className="flex">
        <img
          src={`/database-types/logo-${database.type}.png`}
          className="w-[32px] h-[32px] mr-2 mt-1 align-middle"
          aria-label={`${database.type} Database`}
        />
        <p className="flex flex-col">
          <span className={tokens.type["table link"]}>{database.handle}</span>
          <span className={tokens.type["normal lighter"]}>
            {image.description}
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

const DatabaseIdCell = ({ database }: DatabaseCellProps) => {
  return <Td className="flex-1">{database.id}</Td>;
};

const DatabaseCostCell = ({ database }: DatabaseCellProps) => {
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  const { monthlyCost: currentPrice } = calculateCost({
    services: [service],
    disks: [disk]
  })
  return (
    <Td>
      <div className={tokens.type.darker}>${currentPrice.toFixed(2)}</div>
    </Td>
  );
};

export const LastOpCell = ({ database }: DatabaseCellProps) => {
  const lastOperation = useSelector((s) =>
    selectLatestOpByDatabaseId(s, { dbId: database.id }),
  );
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
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
        {prettyDateTime(lastOperation.createdAt)}
      </div>
    </Td>
  );
};

const DatabaseDiskSizeCell = ({ database }: DatabaseCellProps) => {
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  return <Td className="text-gray-900">{disk.size} GB</Td>;
};

const DatabaseContainerSizeCell = ({ database }: DatabaseCellProps) => {
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const metrics = calcMetrics([service]);
  return (
    <Td className="text-gray-900">{metrics.totalMemoryLimit / 1024} GB</Td>
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

const SortIcon = () => (
  <div className="inline-block">
    <IconChevronDown
      variant="sm"
      className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
    />
  </div>
);

export const DatabaseListByOrg = () => {
  const { isLoading } = useQuery(fetchDatabases());
  useQuery(fetchEnvironments());
  useQuery(fetchDatabaseImages());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [sortBy, setSortBy] = useState<keyof DeployDatabaseRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const dbs = useSelector((s) =>
    selectDatabasesForTableSearch(s, {
      search,
      sortBy,
      sortDir,
    }),
  );
  const paginated = usePaginate(dbs);
  const onSort = (key: keyof DeployDatabaseRow) => {
    if (key === sortBy) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="Databases provide data persistence and are automatically configured and managed.">
          Databases
        </TitleBar>

        <FilterBar>
          <div className="flex justify-between">
            <Group variant="horizontal" size="sm" className="items-center">
              <InputSearch
                placeholder="Search..."
                search={search}
                onChange={onChange}
              />
              <LoadingBar isLoading={isLoading} />
            </Group>

            <ActionBar>
              <ButtonLink to={createDbUrl()}>
                <IconPlusCircle variant="sm" className="mr-2" /> New Database
              </ButtonLink>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Databases</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("handle")}
          >
            Handle <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("id")}
          >
            ID <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("envHandle")}
          >
            Environment <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("diskSize")}
          >
            Disk Size <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("containerSize")}
          >
            Container Size <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("cost")}
          >
            Est. Monthly Cost <SortIcon />
          </Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
          {paginated.data.map((db) => (
            <Tr key={db.id}>
              <DatabasePrimaryCell database={db} />
              <DatabaseIdCell database={db} />
              <EnvStackCell environmentId={db.environmentId} />
              <DatabaseDiskSizeCell database={db} />
              <DatabaseContainerSizeCell database={db} />
              <DatabaseCostCell database={db} />
              <DatabaseActionsCell database={db} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const DatabaseListByEnvironment = ({
  envId,
}: {
  envId: string;
}) => {
  const navigate = useNavigate();
  useQuery(fetchDatabases());
  useQuery(fetchEnvironmentById({ id: envId }));
  const onCreate = () => {
    navigate(environmentCreateDbUrl(envId));
  };
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const dbs = useSelector((s) =>
    selectDatabasesForTableSearchByEnvironmentId(s, {
      envId,
      search,
    }),
  );
  const paginated = usePaginate(dbs);

  return (
    <Group>
      <FilterBar>
        <div className="flex justify-between">
          <InputSearch
            placeholder="Search..."
            search={search}
            onChange={onChange}
          />

          <ActionBar>
            <ButtonCreate envId={envId} onClick={onCreate}>
              <IconPlusCircle variant="sm" />
              <div className="ml-2">New Database</div>
            </ButtonCreate>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{paginated.totalItems} Databases</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>ID</Th>
          <Th>Disk Size</Th>
          <Th>Container Size</Th>
          <Th>Est. Monthly Cost</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
          {paginated.data.map((db) => (
            <Tr key={db.id}>
              <DatabasePrimaryCell database={db} />
              <DatabaseIdCell database={db} />
              <DatabaseDiskSizeCell database={db} />
              <DatabaseContainerSizeCell database={db} />
              <DatabaseCostCell database={db} />
              <DatabaseActionsCell database={db} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const DatabaseDependencyList = ({
  databases,
}: {
  databases: DatabaseDependency[];
}) => {
  return (
    <Table>
      <THead>
        <Th>Handle</Th>
        <Th>ID</Th>
        <Th>Environment</Th>
        <Th>Disk Size</Th>
        <Th>Container Size</Th>
        <Th>Est. Monthly Cost</Th>
        <Th>Reason</Th>
      </THead>

      <TBody>
        {databases.length === 0 ? <EmptyTr colSpan={6} /> : null}
        {databases.map((dep) => {
          const db = dep.resource;

          return (
            <Tr key={dep.why}>
              <DatabasePrimaryCell database={db} />
              <DatabaseIdCell database={db} />
              <EnvStackCell environmentId={db.environmentId} />
              <DatabaseDiskSizeCell database={db} />
              <DatabaseContainerSizeCell database={db} />
              <DatabaseCostCell database={db} />
              <Td>
                <Tooltip placement="left" text={dep.why} fluid>
                  <Code>{dep.why}</Code>
                </Tooltip>
              </Td>
            </Tr>
          );
        })}
      </TBody>
    </Table>
  );
};
