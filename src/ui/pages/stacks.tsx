import {
  fetchStacks,
  getStackType,
  selectAppsCountByStack,
  selectDatabasesCountByStack,
  selectEnvironmentsCountByStack,
  selectStacksForTableSearch,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { createStackUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployStack } from "@app/types";
import { useSelector } from "react-redux";
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
  const stackType = getStackType(stack);
  const envCount = useSelector((s: AppState) =>
    selectEnvironmentsCountByStack(s, { stackId: stack.id }),
  );
  const appCount = useSelector((s: AppState) =>
    selectAppsCountByStack(s, { stackId: stack.id }),
  );
  const dbCount = useSelector((s: AppState) =>
    selectDatabasesCountByStack(s, { stackId: stack.id }),
  );

  return (
    <Tr>
      <Td>
        <StackItemView stack={stack} />
      </Td>
      <Td>{stack.id}</Td>
      <Td>{stack.region}</Td>
      <Td>{capitalize(stackType)}</Td>
      <Td>{stack.memoryLimits ? "Memory" : ""}</Td>
      <Td variant="center">{envCount}</Td>
      <Td variant="center">{appCount}</Td>
      <Td variant="center">{dbCount}</Td>
    </Tr>
  );
}

function StackList() {
  useQuery(fetchStacks());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const stacks = useSelector((s: AppState) =>
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
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />

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
