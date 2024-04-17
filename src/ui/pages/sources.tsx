import {
  DeploySourceRow,
  fetchApps,
  selectSourcesForTableSearch,
} from "@app/deploy";
import { fetchDeployments } from "@app/deployment";
import { useSelector } from "@app/react";
import { sourceDetailUrl } from "@app/routes";
import { fetchSources } from "@app/source";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "starfx/react";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  DescBar,
  EmptyTr,
  FilterBar,
  GitRef,
  Group,
  IconChevronDown,
  InputSearch,
  LoadingBar,
  PaginateBar,
  SourceLogo,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tooltip,
  Tr,
  tokens,
} from "../shared";

function SourceListRow({ source }: { source: DeploySourceRow }) {
  const liveCommits = source.liveCommits.slice(0, 7);
  const extraLiveCommits = source.liveCommits.length - liveCommits.length;

  return (
    <Tr key={source.id}>
      <Td>
        <Link to={sourceDetailUrl(source.id)} className="flex items-center">
          <SourceLogo
            source={source}
            className="w-[32px] h-[32px] mr-2 align-middle"
          />
          <p className={`${tokens.type["table link"]} leading-8`}>
            {source.displayName}
          </p>
        </Link>
      </Td>
      <Td>
        {liveCommits.length === 0 ? <em>No commit information</em> : null}

        <Group
          variant="horizontal"
          size="xs"
          className="items-center min-w-[150px]"
        >
          {liveCommits.map((liveCommit) => (
            <Tooltip
              key={liveCommit.sha}
              fluid
              theme="light"
              className="py-1"
              variant="top"
              text={
                <GitRef
                  gitRef={liveCommit.ref}
                  commitSha={liveCommit.sha}
                  commitUrl={liveCommit.url}
                />
              }
            >
              <Link
                to="#"
                className="block bg-gray-300 h-[16px] w-[6px] hover:bg-indigo rounded-md"
              />
            </Tooltip>
          ))}
          {extraLiveCommits ? <p>+{extraLiveCommits}</p> : null}
        </Group>
      </Td>
      <Td variant="center" className="center items-center justify-center">
        <div className="text-center">{source.apps.length}</div>
      </Td>
    </Tr>
  );
}

const SortIcon = () => (
  <div className="inline-block">
    <IconChevronDown
      variant="sm"
      className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
    />
  </div>
);

export function SourcesPage() {
  const { isLoading: appsLoading } = useQuery(fetchApps());
  const { isLoading: deploymentsLoading } = useQuery(fetchDeployments());
  const { isLoading: sourcesLoading } = useQuery(fetchSources());
  const isLoading = appsLoading || deploymentsLoading || sourcesLoading;

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const defaultSortBy =
    (params.get("sortBy") as keyof DeploySourceRow) || "handle";
  const defaultSortDir = (params.get("asc") as "asc" | "desc") || "asc";
  const [sortBy, setSortBy] = useState<typeof defaultSortBy>(defaultSortBy);
  const [sortDir, setSortDir] = useState<typeof defaultSortDir>(defaultSortDir);

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams(
      (prev) => {
        prev.set("search", ev.currentTarget.value);
        return prev;
      },
      { replace: true },
    );
  };
  const onSort = (key: keyof DeploySourceRow) => {
    const newSortBy = key;
    const newSortDir = sortDir === "asc" ? "desc" : "asc";

    if (newSortBy === sortBy) {
      setSortDir(newSortDir);
    } else {
      setSortBy(newSortBy);
      setSortDir(defaultSortDir);
    }

    setParams(
      (prev) => {
        prev.set("sortBy", newSortBy);
        prev.set("sortDir", newSortDir);
        return prev;
      },
      { replace: true },
    );
  };

  const sources = useSelector((s) =>
    selectSourcesForTableSearch(s, {
      search,
      sortBy,
      sortDir,
    }),
  );
  const paginated = usePaginate(sources);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Sources connect apps with code repositories to show you what's deployed where.">
            Sources
          </TitleBar>

          <FilterBar>
            <div className="flex justify-between">
              <InputSearch
                placeholder="Search..."
                search={search}
                onChange={onChange}
              />
            </div>
            <Group variant="horizontal" size="sm" className="items-center">
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
              onClick={() => onSort("displayName")}
            >
              Name <SortIcon />
            </Th>
            <Th
              className="cursor-pointer hover:text-black group"
              onClick={() => onSort("liveCommits")}
            >
              Live Commits <SortIcon />
            </Th>
            <Th
              variant="center"
              className="cursor-pointer hover:text-black group"
              onClick={() => onSort("apps")}
            >
              Apps <SortIcon />
            </Th>
          </THead>

          <TBody>
            {paginated.data.length === 0 ? <EmptyTr colSpan={3} /> : null}
            {paginated.data.map((source) => (
              <SourceListRow source={source} key={source.id} />
            ))}
          </TBody>
        </Table>
      </Group>
    </AppSidebarLayout>
  );
}
