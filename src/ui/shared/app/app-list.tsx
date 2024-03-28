import { prettyDateTime } from "@app/date";
import {
  DeployAppRow,
  calcMetrics,
  calcServiceMetrics,
  fetchApps,
  fetchEnvironmentById,
  fetchEnvironments,
  fetchImageById,
  selectAppsByCertId,
  selectAppsForTableSearch,
  selectAppsForTableSearchByEnvironmentId,
  selectAppsForTableSearchBySourceId,
  selectImageById,
  selectLatestOpByAppId,
  selectServicesByAppId,
} from "@app/deploy";
import { fetchDeploymentById, selectDeploymentById } from "@app/deployment";
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
import { Code } from "../code";
import { OptionalExternalLink } from "../external-link";
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

const GitRefCell = ({
  gitRef,
  commitSha,
  commitUrl,
}: { gitRef: string | null; commitSha: string; commitUrl?: string }) => {
  const ref = gitRef?.trim() || "";
  const sha = commitSha.trim().slice(0, 7);
  const url = commitUrl || "";

  return (
    <Td>
      <Code>{ref || sha}</Code>
      {ref && sha && ref !== sha ? (
        <>
          {" "}
          @{" "}
          <Code>
            <OptionalExternalLink
              href={url}
              linkIf={!!url.match(/^https?:\/\//)}
            >
              {sha}
            </OptionalExternalLink>
          </Code>
        </>
      ) : null}
    </Td>
  );
};
const GitCommitMessageCell = ({ message }: { message: string }) => {
  const firstLine = message.trim().split("\n")[0];
  return (
    <Td>
      <Tooltip text={message} fluid>
        <p className="leading-8 text-ellipsis whitespace-nowrap max-w-[30ch] overflow-hidden inline-block">
          {firstLine}
          {message.length > firstLine.length ? " ..." : ""}
        </p>
      </Tooltip>
    </Td>
  );
};

const DockerImageCell = ({
  image,
  digest,
  repoUrl,
}: { image: string; digest: string; repoUrl?: string }) => {
  const shortDigest = digest.replace("sha256:", "").slice(0, 11);
  const url = repoUrl || "";

  return (
    <Td>
      <Code>
        <OptionalExternalLink href={url} linkIf={!!url.match(/^https?:\/\//)}>
          {image}
        </OptionalExternalLink>
      </Code>{" "}
      @ <Code>sha256:{shortDigest}</Code>
    </Td>
  );
};

const AppListBySourceRow = ({ app }: { app: DeployApp }) => {
  useQuery(fetchDeploymentById({ id: app.currentDeploymentId }));
  const deployment = useSelector((s) =>
    selectDeploymentById(s, { id: app.currentDeploymentId }),
  );

  useQuery(fetchImageById({ id: app.currentImageId }));
  const currentImage = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );

  return (
    <Tr>
      <AppPrimaryCell app={app} />
      <AppIdCell app={app} />
      <GitRefCell
        gitRef={deployment.gitRef}
        commitSha={deployment.gitCommitSha}
        commitUrl={deployment.gitCommitUrl}
      />
      <GitCommitMessageCell message={deployment.gitCommitMessage} />
      <DockerImageCell
        image={deployment.dockerImage || currentImage.dockerRepo}
        digest={currentImage.dockerRef}
        repoUrl={deployment.dockerRepositoryUrl}
      />
      <Td>{prettyDateTime(deployment.createdAt)}</Td>
    </Tr>
  );
};

export const AppListBySource = ({
  sourceId,
}: {
  sourceId: string;
}) => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const apps = useSelector((s) =>
    selectAppsForTableSearchBySourceId(s, {
      sourceId,
      search,
    }),
  );
  const paginated = usePaginate(apps);

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
          </div>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Apps</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>ID</Th>
          <Th>Git Ref</Th>
          <Th>Commit Message</Th>
          <Th>Docker Image</Th>
          <Th>Last Deployed</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((app) => (
            <AppListBySourceRow app={app} key={app.id} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
