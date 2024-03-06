import {
  fetchEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentStatsById,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import { useLoader, useQuery, useSelector } from "@app/react";
import {
  createEnvUrl,
  environmentAppsUrl,
  environmentBackupsUrl,
  environmentDatabasesUrl,
  stackDetailEnvsUrl,
} from "@app/routes";
import type { DeployEnvironment } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ButtonAnyOwner } from "../button";
import { Group } from "../group";
import { IconPlusCircle } from "../icons";
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
  env: DeployEnvironment;
}

export const EnvironmentItemView = ({ env }: EnvironmentCellProps) => {
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

const EnvironmentAppsCell = ({ env }: EnvironmentCellProps) => {
  const apps = useSelector((s) => selectAppsByEnvId(s, { envId: env.id }));
  return (
    <Td
      variant="center"
      className="center items-center justify-center min-w-[9ch]"
    >
      <Link to={environmentAppsUrl(env.id)}>
        <div className={`${tokens.type["table link"]} text-center`}>
          {apps.length}
        </div>
      </Link>
    </Td>
  );
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

const EnvironmentBackupsCell = ({ env }: EnvironmentCellProps) => {
  const environments = useSelector((s) =>
    selectEnvironmentStatsById(s, { envId: env.id }),
  );
  return (
    <Td variant="center" className="center items-center justify-center">
      <Link to={environmentBackupsUrl(env.id)}>
        <div className={`${tokens.type["table link"]} text-center`}>
          {environments.totalBackupSize} GB
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

export function EnvironmentList({
  stackId = "",
  showTitle = true,
}: { stackId?: string; showTitle?: boolean }) {
  useQuery(fetchEnvironments());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const { isLoading } = useLoader(fetchEnvironments());
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const navigate = useNavigate();
  const onCreate = () => {
    navigate(createEnvUrl(stackId ? `stack_id=${stackId}` : ""));
  };

  const envs = useSelector((s) =>
    selectEnvironmentsForTableSearch(s, { search, stackId }),
  );
  const paginated = usePaginate(envs);

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
              <ButtonAnyOwner onClick={onCreate}>
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
          <Th>Environment</Th>
          <Th>ID</Th>
          <Th>Stack</Th>
          <Th variant="center">Apps</Th>
          <Th variant="center">Databases</Th>
          <Th variant="center">Backups</Th>
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
              <EnvironmentBackupsCell env={env} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
