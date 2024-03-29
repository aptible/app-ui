import { prettyDateTime } from "@app/date";
import {
  DeployAppRow,
  calcServiceMetrics,
  fetchApps,
  fetchEnvironmentById,
  fetchEnvironments,
  selectAppsByCertId,
  selectAppsForTableSearch,
  selectAppsForTableSearchByEnvironmentId,
  selectLatestOpByAppId,
  selectServicesByAppId,
} from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import {
  appDetailUrl,
  environmentCreateAppUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { DeployApp } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ButtonCreate } from "../button";
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

interface AppCellProps {
  app: DeployApp;
}

export const AppItemView = ({ app }: { app: DeployApp }) => {
  return (
    <Link to={appDetailUrl(app.id)} className="flex">
      <img
        src="/resource-types/logo-app.png"
        className="w-[32px] h-[32px] mr-2 align-middle"
        aria-label="App"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>{app.handle}</p>
    </Link>
  );
};

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <AppItemView app={app} />
    </Td>
  );
};

const AppIdCell = ({ app }: AppCellProps) => {
  return <Td>{app.id}</Td>;
};

const AppServicesCell = ({ app }: AppCellProps) => {
  const services = useSelector((s) =>
    selectServicesByAppId(s, { appId: app.id }),
  );
  const metrics = calcMetrics(services);
  return (
    <Td>
      <div className={tokens.type.darker}>{`${services.length} Services`}</div>
      <div className={tokens.type["normal lighter"]}>
        {metrics.totalMemoryLimit / 1024} GB &middot; {metrics.totalCPU} CPU
      </div>
    </Td>
  );
};

const AppCostCell = ({ app }: AppCellProps) => {
  const services = useSelector((s) =>
    selectServicesByAppId(s, { appId: app.id }),
  );
  const cost = services.reduce((acc, service) => {
    const mm = calcServiceMetrics(service);
    return acc + (mm.estimatedCostInDollars * 1024) / 1000;
  }, 0);

  return (
    <Td>
      <div className={tokens.type.darker}>
        {cost.toLocaleString("en", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        })}
      </div>
    </Td>
  );
};

export const AppLastOpCell = ({ app }: AppCellProps) => {
  const lastOperation = useSelector((s) =>
    selectLatestOpByAppId(s, { appId: app.id }),
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
            {prettyDateTime(lastOperation.createdAt)}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>No activity</div>
      )}
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

export const AppListByOrg = () => {
  const { isLoading } = useQuery(fetchApps());
  useQuery(fetchEnvironments());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [sortBy, setSortBy] = useState<keyof DeployAppRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const apps = useSelector((s) =>
    selectAppsForTableSearch(s, { search, sortBy, sortDir }),
  );
  const paginated = usePaginate(apps);
  const onSort = (key: keyof DeployAppRow) => {
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
        <TitleBar description="Apps are how you deploy your code, scale services, and manage endpoints.">
          Apps
        </TitleBar>

        <FilterBar>
          <Group variant="horizontal" size="sm" className="items-center">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />
            <LoadingBar isLoading={isLoading} />
          </Group>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Apps</DescBar>
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
            onClick={() => onSort("totalServices")}
          >
            Services <SortIcon />
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
          {paginated.data.map((app) => (
            <Tr key={app.id}>
              <AppPrimaryCell app={app} />
              <AppIdCell app={app} />
              <EnvStackCell environmentId={app.environmentId} />
              <AppServicesCell app={app} />
              <AppCostCell app={app} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const AppListByEnvironment = ({
  envId,
}: {
  envId: string;
}) => {
  const navigate = useNavigate();
  useQuery(fetchEnvironmentById({ id: envId }));
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [sortBy, setSortBy] = useState<keyof DeployAppRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const apps = useSelector((s) =>
    selectAppsForTableSearchByEnvironmentId(s, {
      envId,
      search,
      sortBy,
      sortDir,
    }),
  );
  const paginated = usePaginate(apps);
  const onSort = (key: keyof DeployAppRow) => {
    if (key === sortBy) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const onCreate = () => {
    navigate(environmentCreateAppUrl(envId));
  };

  return (
    <Group>
      <Group size="sm">
        <FilterBar>
          <div className="flex justify-between">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />

            <ActionBar>
              <ButtonCreate envId={envId} onClick={onCreate}>
                <IconPlusCircle variant="sm" />{" "}
                <div className="ml-2">New App</div>
              </ButtonCreate>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Apps</DescBar>
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
            onClick={() => onSort("totalServices")}
          >
            Services <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("cost")}
          >
            Est. Monthly Cost <SortIcon />
          </Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={4} /> : null}
          {paginated.data.map((app) => (
            <Tr key={app.id}>
              <AppPrimaryCell app={app} />
              <AppIdCell app={app} />
              <AppServicesCell app={app} />
              <AppCostCell app={app} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const AppListByCertificate = ({
  certId,
  envId,
}: {
  certId: string;
  envId: string;
}) => {
  const apps = useSelector((s) =>
    selectAppsByCertId(s, {
      certId,
      envId,
    }),
  );
  const paginated = usePaginate(apps);

  return (
    <Group>
      <FilterBar>
        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{paginated.totalItems} Apps</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>ID</Th>
          <Th>Environment</Th>
          <Th>Services</Th>
          <Th>Est. Monthly Cost</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((app) => (
            <Tr key={app.id}>
              <AppPrimaryCell app={app} />
              <AppIdCell app={app} />
              <EnvStackCell environmentId={app.environmentId} />
              <AppServicesCell app={app} />
              <AppCostCell app={app} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
