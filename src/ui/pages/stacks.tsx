import {
  fetchCostsByStacks,
  fetchStacks,
  formatCurrency,
  getStackTypeTitle,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useLoader, useQuery, useSelector } from "@app/react";
import { createStackUrl } from "@app/routes";
import {
  type DeployStackRow,
  selectStacksForTableSearch,
} from "@app/stack-table";
import { useState } from "react";
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
  TFoot,
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
  return (
    <Tr>
      <Td>
        <StackItemView stack={stack} />
      </Td>
      <Td>{stack.id}</Td>
      <Td>{stack.region}</Td>
      <Td>{getStackTypeTitle(stack)}</Td>
      <Td>{stack.memoryLimits ? "Memory" : ""}</Td>
      <Td variant="center">{stack.envCount}</Td>
      <Td variant="center">{stack.appCount}</Td>
      <Td variant="center">{stack.dbCount}</Td>
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

  // Calculate total cost of all stacks
  const totalCost = stacks.reduce((sum, stack) => sum + (stack.cost || 0), 0);
  const paginated = usePaginate(stacks);

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

        {paginated.data.length > 0 && (
          <TFoot>
            <Tr className="font-medium">
              <Td colSpan={8} className="text-right font-semibold text-black">
                Total Est. Monthly Cost
              </Td>
              <Td>
                <span className="font-semibold text-black">
                  {formatCurrency(totalCost)}
                </span>
              </Td>
            </Tr>
          </TFoot>
        )}
      </Table>
    </Group>
  );
}
