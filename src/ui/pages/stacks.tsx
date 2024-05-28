import {
  fetchStacks,
  getStackTypeTitle,
  selectAppsCountByStack,
  selectDatabasesCountByStack,
  selectEnvironmentsCountByStack,
  selectStacksForTableSearch,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { createStackUrl } from "@app/routes";
import type { DeployStack } from "@app/types";
import { useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  ButtonLink,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
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

function StackListRow({ stack }: { stack: DeployStack }) {
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
    </Tr>
  );
}

function StackList() {
  const { isLoading } = useQuery(fetchStacks());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const stacks = useSelector((s) =>
    selectStacksForTableSearch(s, {
      search,
    }),
  );
  const paginated = usePaginate(stacks);

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
          <Th>Name</Th>
          <Th>ID</Th>
          <Th>Region</Th>
          <Th>Type</Th>
          <Th>Enabled Limits</Th>
          <Th variant="center">Environments</Th>
          <Th variant="center">Apps</Th>
          <Th variant="center">Databases</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={8} /> : null}
          {paginated.data.map((stack) => (
            <StackListRow stack={stack} key={stack.id} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
}
