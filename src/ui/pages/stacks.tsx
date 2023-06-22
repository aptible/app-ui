import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

import {
  fetchAllStacks,
  getStackType,
  selectAppsCountByStack,
  selectDatabasesCountByStack,
  selectEnvironmentsCountByStack,
  selectStacksForTableSearch,
} from "@app/deploy";
import { AppState, DeployStack } from "@app/types";

import { MenuWrappedPage } from "../layouts";
import {
  InputSearch,
  LoadResources,
  ResourceHeader,
  ResourceListView,
  TableHead,
  Td,
} from "../shared";
import { capitalize } from "@app/string-utils";

export function StacksPage() {
  return (
    <MenuWrappedPage>
      <StackList />
    </MenuWrappedPage>
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
    <tr>
      <Td>
        <div className="flex items-center">
          <img
            src={
              stackType === "dedicated"
                ? "/logo-dedicated-stack.png"
                : "/logo-stack.png"
            }
            alt="stack icon"
            className="w-8 h-8 mr-2"
          />
          <div>{stack.name}</div>
        </div>
      </Td>
      <Td>{stack.region}</Td>
      <Td>
        <span
          className={
            stackType === "dedicated" ? "text-forest" : "text-orange-400"
          }
        >
          {capitalize(stackType)}
        </span>
      </Td>
      <Td>
        {stack.cpuLimits ? "CPU" : ""}
        {stack.cpuLimits && stack.memoryLimits ? ", " : ""}
        {stack.memoryLimits ? "Memory" : ""}
      </Td>
      <Td className="text-center">{envCount}</Td>
      <Td className="text-center">{appCount}</Td>
      <Td className="text-center">{dbCount}</Td>
    </tr>
  );
}

function StackList() {
  const query = useQuery(fetchAllStacks());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const stacks = useSelector((s: AppState) =>
    selectStacksForTableSearch(s, {
      search,
    }),
  );

  return (
    <LoadResources query={query} isEmpty={stacks.length === 0 && search === ""}>
      <ResourceListView
        header={
          <ResourceHeader
            title="Stacks"
            filterBar={
              <InputSearch
                placeholder="Search stacks..."
                search={search}
                onChange={onChange}
              />
            }
          />
        }
        tableHeader={
          <TableHead
            headers={[
              "Name",
              "Region",
              "Type",
              "Enabled Limits",
              "Environments",
              "Apps",
              "Databases",
            ]}
            centerAlignedColIndices={[4, 5, 6]}
          />
        }
        tableBody={
          <>
            {stacks.map((stack) => (
              <StackListRow stack={stack} key={stack.id} />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}
