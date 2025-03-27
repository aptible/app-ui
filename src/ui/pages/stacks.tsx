import {
  fetchCostsByStacks,
  fetchStacks,
  getStackTypeTitle,
  selectAppsCountByStack,
  selectDatabasesCountByStack,
  selectEnvironmentsCountByStack,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useLoader, useQuery, useSelector } from "@app/react";
import { createStackUrl } from "@app/routes";
import {
  type DeployStackRow,
  selectStacksForTableSearch,
} from "@app/stack-table";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  ButtonLink,
  CostEstimateTooltip,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconChevronDown,
  IconPlusCircle,
  InputSearch,
  LoadingBar,
  PaginateBar,
  StackItemView,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

export function StacksPage() {
  return (
    <AppSidebarLayout>
      <StackList />
    </AppSidebarLayout>
  );
}

function StackListRow({ stack }: { stack: DeployStackRow }) {
  const { isLoading } = useLoader(fetchCostsByStacks);
  const envCount = useSelector((s) =>
    selectEnvironmentsCountByStack(s, { stackId: stack.id }),
  );
  const appCount = useSelector((s) =>
    selectAppsCountByStack(s, { stackId: stack.id }),
  );
  const dbCount = useSelector((s) =>
    selectDatabasesCountByStack(s, { stackId: stack.id }),
  );

  return (
    <Tr>
      <Td>
        <StackItemView stack={stack} />
      </Td>
      <Td>{stack.id}</Td>
      <Td>{stack.region}</Td>
      <Td>{getStackTypeTitle(stack)}</Td>
      <Td>{stack.memoryLimits ? "Memory" : ""}</Td>
      <Td variant="center">{envCount}</Td>
      <Td variant="center">{appCount}</Td>
      <Td variant="center">{dbCount}</Td>
      <Td>
        <CostEstimateTooltip cost={isLoading ? null : stack.cost} />
      </Td>
    </Tr>
  );
}

function StackList() {
  const orgId = useSelector(selectOrganizationSelectedId);
  useQuery(fetchCostsByStacks({ orgId }));
  const { isLoading } = useLoader(fetchStacks());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const [sortKey, setSortKey] = useState<
    keyof DeployStackRow | "envCount" | "appCount" | "dbCount"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };

  const onSort = (
    key: keyof DeployStackRow | "envCount" | "appCount" | "dbCount",
  ) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const stacks = useSelector((s) =>
    selectStacksForTableSearch(s, {
      search,
      sortKey: sortKey as keyof DeployStackRow,
      sortDirection,
    }),
  );

  const envCounts = useSelector((s) => {
    const counts = new Map<string, number>();
    stacks.forEach((stack) => {
      counts.set(
        stack.id,
        selectEnvironmentsCountByStack(s, { stackId: stack.id }),
      );
    });
    return counts;
  });

  const appCounts = useSelector((s) => {
    const counts = new Map<string, number>();
    stacks.forEach((stack) => {
      counts.set(stack.id, selectAppsCountByStack(s, { stackId: stack.id }));
    });
    return counts;
  });

  const dbCounts = useSelector((s) => {
    const counts = new Map<string, number>();
    stacks.forEach((stack) => {
      counts.set(
        stack.id,
        selectDatabasesCountByStack(s, { stackId: stack.id }),
      );
    });
    return counts;
  });

  const sortedStacks = useMemo(() => {
    if (
      sortKey === "envCount" ||
      sortKey === "appCount" ||
      sortKey === "dbCount"
    ) {
      return [...stacks].sort((a, b) => {
        const aCount =
          sortKey === "envCount"
            ? envCounts.get(a.id) || 0
            : sortKey === "appCount"
              ? appCounts.get(a.id) || 0
              : dbCounts.get(a.id) || 0;
        const bCount =
          sortKey === "envCount"
            ? envCounts.get(b.id) || 0
            : sortKey === "appCount"
              ? appCounts.get(b.id) || 0
              : dbCounts.get(b.id) || 0;
        return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
      });
    }
    return stacks;
  }, [stacks, sortKey, sortDirection, envCounts, appCounts, dbCounts]);

  const paginated = usePaginate(sortedStacks);

  const SortIcon = () => (
    <div className="inline-block">
      <IconChevronDown
        variant="sm"
        className="top-1 -ml-1 relative group-hover:opacity-100 opacity-50"
      />
    </div>
  );

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="Stacks represent the virtualized infrastructure where resources are deployed.">
          Stacks
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
              <ButtonLink to={createStackUrl()}>
                <IconPlusCircle variant="sm" className="mr-2" /> New Dedicated
                Stack
              </ButtonLink>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Stacks</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("name")}
          >
            Name <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("id")}
          >
            ID <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("region")}
          >
            Region <SortIcon />
          </Th>
          <Th>Type</Th>
          <Th>Enabled Limits</Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("envCount")}
            variant="center"
          >
            Environments <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("appCount")}
            variant="center"
          >
            Apps <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group"
            onClick={() => onSort("dbCount")}
            variant="center"
          >
            Databases <SortIcon />
          </Th>
          <Th
            className="cursor-pointer hover:text-black group flex space-x-2"
            onClick={() => onSort("cost")}
          >
            <div>Est. Monthly Cost</div>
            <SortIcon />
          </Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={9} /> : null}
          {paginated.data.map((stack) => (
            <StackListRow key={stack.id} stack={stack} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
