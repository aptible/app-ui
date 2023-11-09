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
  Button,
  ButtonIcon,
  ButtonLink,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconArrowLeft,
  IconArrowRight,
  IconPlusCircle,
  InputSearch,
  LoadingBar,
  PaginateBar,
  Select,
  SelectOption,
  StackItemView,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

const selectOption = (option: SelectOption) => {
  setChoice(option.value);
};
const options: SelectOption[] = Array(8)
  .fill(0)
  .map((_, idx) => ({
    label: "Page Size: 50",
    value: `option_${idx + 1}`,
  }));
const selectedOption = [].find(
  (option: SelectOption) => option.value === choice,
);

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
  const { isLoading } = useQuery(fetchStacks());
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
      <Group
        variant="horizontal"
        size="sm"
        className="mt-2 items-center flex flex-row justify-between"
      >
        <Group variant="horizontal" size="sm" className="items-center">
          <Button variant="white" size="sm">
            First
          </Button>
          <ButtonIcon
            variant="white"
            size="sm"
            icon={<IconArrowLeft className="h-[14px] w-[14px]" variant="sm" />}
          />
          <Button variant="active" size="sm">
            1
          </Button>
          <Button variant="white" size="sm">
            2
          </Button>
          <Button variant="white" size="sm">
            3
          </Button>
          <p className="text-sm leading-4 font-medium">of</p>
          <Button variant="white" size="sm">
            99
          </Button>
          <ButtonIcon
            variant="white"
            size="sm"
            icon={<IconArrowRight className="h-[14px] w-[14px]" variant="sm" />}
          />
          <Button variant="white" size="sm">
            Last
          </Button>
        </Group>
        <Select
          className="py-[8px] text-sm leading-4 font-medium"
          onSelect={selectOption}
          value={selectedOption}
          options={options}
        />
      </Group>
    </Group>
  );
}
