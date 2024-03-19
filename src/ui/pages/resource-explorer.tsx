import { appDetailUrl, databaseDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Button,
  FilterBar,
  Group,
  IconChevronDown,
  IconChevronRight,
  InputSearch,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

interface ResourceNode {
  resourceType: "app" | "database" | "external";
  handle: string;
  id: string;
  dependsOn: string[];
}

interface ResourceNodeComputed extends ResourceNode {
  dependsOnMe: string[];
}

const nodes: ResourceNode[] = [
  {
    resourceType: "app",
    handle: "auth-api-us-east-1",
    id: "63799",
    dependsOn: ["118912", "auth-api-pg"],
  },
  {
    resourceType: "external",
    handle: "auth-api-pg",
    id: "auth-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "auth-api-redis",
    id: "118912",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "billing-api",
    id: "9234",
    dependsOn: ["11681", "63799"],
  },
  {
    resourceType: "database",
    handle: "pg-billing",
    id: "11681",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "deploy-api",
    id: "63798",
    dependsOn: ["118918", "deploy-api-pg", "63799"],
  },
  {
    resourceType: "external",
    handle: "deploy-api-pg",
    id: "deploy-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "deploy-api-redis",
    id: "118918",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "metrictunnel",
    id: "5415",
    dependsOn: ["118918", "metrictunnel-influxdb"],
  },
  {
    resourceType: "external",
    handle: "metrictunnel-influxdb",
    id: "metrictunnel-influxdb",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "deploy-ui",
    id: "35007",
    dependsOn: ["63799", "9234", "63798", "5415"],
  },
  {
    resourceType: "app",
    handle: "app-ui",
    id: "54710",
    dependsOn: ["63799", "9234", "63798", "5415"],
  },
];

function computeNodes(nodes: ResourceNode[]): ResourceNodeComputed[] {
  const map: { [key: string]: Set<string> } = {};
  nodes.forEach((node) => {
    node.dependsOn.forEach((nId) => {
      if (!map[nId]) {
        map[nId] = new Set<string>();
      }
      map[nId].add(node.id);
    });
  });

  return nodes.map((n) => {
    let dependsOnMe: string[] = [];
    if (map[n.id]) {
      dependsOnMe = [...map[n.id]];
    }
    return {
      ...n,
      dependsOnMe,
    };
  });
}

function HandleCell({ node }: { node: ResourceNode }) {
  if (node.resourceType === "external") {
    return <span>{node.handle}</span>;
  }

  if (node.resourceType === "database") {
    return <Link to={databaseDetailUrl(node.id)}>{node.handle}</Link>;
  }

  return <Link to={appDetailUrl(node.id)}>{node.handle}</Link>;
}

function ResourceRow({
  node,
  onClick,
  isSelected,
}: {
  node: ResourceNodeComputed;
  onClick: (id: string) => void;
  isSelected: boolean;
}) {
  return (
    <Tr className={isSelected ? "bg-off-white" : ""}>
      <Td>
        <HandleCell node={node} />
      </Td>
      <Td>{capitalize(node.resourceType)}</Td>
      <Td variant="center">{node.dependsOn.length}</Td>
      <Td variant="center">{node.dependsOnMe.length}</Td>
      <Td variant="right">
        <Button size="sm" onClick={() => onClick(node.id)}>
          View
        </Button>
      </Td>
    </Tr>
  );
}

function NodeViewer({
  node,
  nodes,
  onClick,
}: {
  node: ResourceNodeComputed;
  nodes: ResourceNodeComputed[];
  onClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-row w-full">
      <div className="flex flex-col w-full">
        <div className="py-3 px-4 bg-gray-50 border-b last:border-black-100 flex flex-row gap-4">
          <h3 className={tokens.type.h3}>{node.handle}</h3>
        </div>
        <div className="flex flex-row w-full h-full">
          <div className="flex-1 border-r border-black-100">
            <div className="py-3 px-4 bg-gray-50 border-b last:border-black-100 text-sm text-gray-500">
              Required Connections
            </div>
            {node.dependsOn.map((nId) => {
              const found = nodes.find((n) => nId === n.id);
              if (!found) return null;
              return (
                <div
                  key={found.id}
                  onClick={() => onClick(nId)}
                  onKeyUp={() => onClick(nId)}
                  className="group hover:bg-gray-50 cursor-pointer flex items-center border-b border-black-100 py-3 px-4"
                >
                  <div className="grow text-sm">{found.handle}</div>
                  <IconChevronRight
                    variant="sm"
                    className="ml-2 group-hover:opacity-100 opacity-50"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex-1">
            <div className="py-3 px-4 bg-gray-50 border-b last:border-black-100 text-sm text-gray-500">
              Dependencies
            </div>
            {node.dependsOnMe.map((nId) => {
              const found = nodes.find((n) => nId === n.id);
              if (!found) return null;
              return (
                <div
                  key={found.id}
                  onClick={() => onClick(nId)}
                  onKeyUp={() => onClick(nId)}
                  className="group hover:bg-gray-50 cursor-pointer flex items-center border-b border-black-100 py-3 px-4"
                >
                  <div className="grow text-sm">{found.handle}</div>
                  <IconChevronRight
                    variant="sm"
                    className="ml-2 group-hover:opacity-100 opacity-50"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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

function sorter(sortBy: keyof ResourceNodeComputed, sortDir: "asc" | "desc") {
  return (a: ResourceNodeComputed, b: ResourceNodeComputed) => {
    if (sortBy === "dependsOnMe") {
      if (sortDir === "asc") {
        return a.dependsOnMe.length - b.dependsOnMe.length;
      } else {
        return b.dependsOnMe.length - a.dependsOnMe.length;
      }
    }

    if (sortBy === "dependsOn") {
      if (sortDir === "asc") {
        return a.dependsOn.length - b.dependsOn.length;
      } else {
        return b.dependsOn.length - a.dependsOn.length;
      }
    }

    if (sortDir === "asc") {
      return a.handle.localeCompare(b.handle);
    } else {
      return b.handle.localeCompare(a.handle);
    }
  };
}

export function ResourceExplorerPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [sortBy, setSortBy] = useState<keyof ResourceNodeComputed>("handle");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const computed = computeNodes(nodes)
    .filter((n) => {
      if (search === "") return true;
      const handle = n.handle.toLocaleLowerCase();
      const srch = search.toLocaleLowerCase();
      return handle.includes(srch);
    })
    .sort(sorter(sortBy, sortDir));
  const [selectedId, setSelectedId] = useState("");
  const selected = computed.find((node) => node.id === selectedId);
  const onSort = (key: keyof ResourceNodeComputed) => {
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
        <TitleBar description="Learn how your resources are connected to each other.">
          Resource Explorer
        </TitleBar>

        <FilterBar>
          <Group variant="horizontal" size="sm" className="items-center">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />
          </Group>
        </FilterBar>
      </Group>

      <Group variant="horizontal">
        <div className="flex-1">
          <Table>
            <THead>
              <Th
                className="cursor-pointer hover:text-black group"
                onClick={() => onSort("handle")}
              >
                Resource <SortIcon />
              </Th>
              <Th>Type</Th>
              <Th
                className="cursor-pointer hover:text-black group"
                onClick={() => onSort("dependsOn")}
                variant="center"
              >
                Required Connections <SortIcon />
              </Th>
              <Th
                className="cursor-pointer hover:text-black group"
                onClick={() => onSort("dependsOnMe")}
                variant="center"
              >
                Dependencies <SortIcon />
              </Th>
              <Th variant="right">Actions</Th>
            </THead>

            <TBody>
              {computed.map((node) => (
                <ResourceRow
                  key={node.id}
                  node={node}
                  onClick={(id: string) => setSelectedId(id)}
                  isSelected={node.id === selectedId}
                />
              ))}
            </TBody>
          </Table>
        </div>

        <div className="bg-white shadow border border-black-100 rounded-lg flex-1 flex items-stretch overflow-hidden">
          {selected ? (
            <NodeViewer
              node={selected}
              nodes={computed}
              onClick={(id: string) => setSelectedId(id)}
            />
          ) : (
            <div className="p-7">
              Choose a resource to view its dependencies.
            </div>
          )}
        </div>
      </Group>
    </Group>
  );
}
