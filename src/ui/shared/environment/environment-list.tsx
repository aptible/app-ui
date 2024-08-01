import {
  fetchDatabases,
  fetchEndpoints,
  fetchEnvironments,
  fetchServices,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectStackById,
} from "@app/deploy";
import {
  type DeployEnvironmentRow,
  selectEnvironmentsForTableSearch,
} from "@app/environment-table";
import { useCompositeLoader, useQuery, useSelector } from "@app/react";
import {
  createEnvUrl,
  environmentAppsUrl,
  environmentDatabasesUrl,
  stackDetailEnvsUrl,
} from "@app/routes";
import type { DeployEnvironment } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ButtonAnyOwner } from "../button";
import { Group } from "../group";
import { IconChevronDown, IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import {
  ActionBar,
  DescBar,
  FilterBar,
  LoadingBar,
  PaginateBar,
  TitleBar,
} from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";

interface EnvironmentCellProps {
  env: DeployEnvironmentRow;
}

export const EnvironmentItemView = ({ env }: { env: DeployEnvironment }) => {
  return (
    <Link to={environmentAppsUrl(env.id)} className="flex">
      <img
        src="/resource-types/logo-environment.png"
        className="w-[32px] h-[32px] mr-2 align-middle"
        aria-label="Environment"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>{env.handle}</p>
    </Link>
  );
};

const EnvironmentPrimaryCell = ({ env }: EnvironmentCellProps) => {
  return (
    <Td>
      <EnvironmentItemView env={env} />
    </Td>
  );
};

const EnvironmentIdCell = ({ env }: EnvironmentCellProps) => {
  return <Td>{env.id}</Td>;
};

const EnvironmentDatabasesCell = ({ env }: EnvironmentCellProps) => {
  const dbs = useSelector((s) => selectDatabasesByEnvId(s, { envId: env.id }));
  return (
    <Td variant="center" className="center items-center justify-center">
      <Link to={environmentDatabasesUrl(env.id)}>
        <div className={`${tokens.type["table link"]} text-center`}>
          {dbs.length}
        </div>
      </Link>
    </Td>
  );
};

const EnvironmentAppsCell = ({ env }: EnvironmentCellProps) => {
  const apps = useSelector((s) => selectAppsByEnvId(s, { envId: env.id }));
  return (
    <Td variant="center" className="center items-center justify-center">
      <Link to={environmentAppsUrl(env.id)}>
        <div className={`${tokens.type["table link"]} text-center`}>
          {apps.length}
        </div>
      </Link>
    </Td>
  );
};

const EnvironmentStackCell = ({ env }: EnvironmentCellProps) => {
  const stack = useSelector((s) => selectStackById(s, { id: env.stackId }));

  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div>
        <div className="text-black">
          <Link
            to={stackDetailEnvsUrl(stack.id)}
            className={tokens.type["table link"]}
          >
            {stack.name}
          </Link>
        </div>
        <div className={tokens.type["normal lighter"]}>
          {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}(
          {stack.region})
        </div>
      </div>
    </Td>
  );
};

const EnvironmentCostCell = ({ env }: EnvironmentCellProps) => {
  return (
    <Td>
      <div className={tokens.type.darker}>
        {env.cost.toLocaleString("en", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        })}
      </div>
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

export function EnvironmentList({
  stackId = "",
  showTitle = true,
}: { stackId?: string; showTitle?: boolean }) {
  useQuery(fetchEnvironments());
  useQuery(fetchServices());
  useQuery(fetchDatabases()); // To fetch embedded disks
  useQuery(fetchEndpoints());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const { isLoading } = useCompositeLoader(
    fetchEnvironments(),
    fetchServices(),
    fetchDatabases(),
    fetchEndpoints(),
  );
  const [sortBy, setSortBy] = useState<keyof DeployEnvironmentRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const navigate = useNavigate();
  const onCreate = () => {
    navigate(createEnvUrl(stackId ? `stack_id=${stackId}` : ""));
  };

  const envs = useSelector((s) =>
    selectEnvironmentsForTableSearch(s, { search, stackId, sortBy, sortDir }),
  );
  const paginated = usePaginate(envs);
  const onSort = (key: keyof DeployEnvironmentRow) => {
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
        <TitleBar
          visible={showTitle}
          description="Environments are how you separate resources like staging and production."
        >
          Environments
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
              <ButtonAnyOwner
                onClick={onCreate}
                tooltipProps={{ placement: "left" }}
              >
                <IconPlusCircle variant="sm" className="mr-2" />
                New Environment
              </ButtonAnyOwner>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Environments</DescBar>
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
            Environment <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("id")}
          >
            ID <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("stackName")}
          >
            Stack <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("totalAppCount")}
            variant="center"
          >
            Apps <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("totalDatabaseCount")}
            variant="center"
          >
            Databases <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("cost")}
          >
            Est. Monthly Cost <SortIcon />
          </Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((env) => (
            <Tr key={env.id}>
              <EnvironmentPrimaryCell env={env} />
              <EnvironmentIdCell env={env} />
              <EnvironmentStackCell env={env} />
              <EnvironmentAppsCell env={env} />
              <EnvironmentDatabasesCell env={env} />
              <EnvironmentCostCell env={env} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
