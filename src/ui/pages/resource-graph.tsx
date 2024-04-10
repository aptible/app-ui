import cytoscape from "cytoscape";

import { appDetailUrl, databaseDetailUrl } from "@app/routes";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  ButtonIcon,
  CytoscapeGraph,
  Group,
  IconBox,
  IconCylinder,
  IconEyeClosed,
  IconFit,
  IconGlobe,
  IconProps,
  IconRefresh,
  IconTarget,
  Input,
  InputSearch,
  iconToDataUri,
} from "../shared";

interface ResourceNode {
  resourceType: "app" | "database" | "external";
  handle: string;
  id: string;
  group?: string;
  dependsOn: string[];
}

const nodes: ResourceNode[] = [
  {
    resourceType: "app",
    handle: "auth-api-us-east-1",
    id: "63799",
    group: "aptible-auth",
    dependsOn: ["118912", "auth-api-pg"],
  },
  {
    resourceType: "external",
    handle: "auth-api-pg",
    group: "vpc-adfb16c4",
    id: "auth-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "auth-api-redis",
    group: "aptible-auth",
    id: "118912",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "billing-api",
    group: "aptible-billing",
    id: "9234",
    dependsOn: ["11681", "63799"],
  },
  {
    resourceType: "database",
    handle: "pg-billing",
    group: "aptible-billing",
    id: "11681",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "deploy-api",
    group: "aptible-deploy",
    id: "63798",
    dependsOn: ["118918", "deploy-api-pg", "63799"],
  },
  {
    resourceType: "external",
    handle: "deploy-api-pg",
    group: "vpc-adfb16c4",
    id: "deploy-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "deploy-api-redis",
    group: "aptible-deploy",
    id: "118918",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "metrictunnel",
    group: "aptible-util",
    id: "5415",
    dependsOn: ["118918", "metrictunnel-influxdb"],
  },
  {
    resourceType: "external",
    handle: "metrictunnel-influxdb",
    id: "metrictunnel-influxdb",
    dependsOn: [],
  },
  // {
  //   resourceType: "app",
  //   handle: "deploy-ui",
  //   group: 'aptible-deploy',
  //   id: "35007",
  //   dependsOn: ["63799", "9234", "63798", "5415"],
  // },
  {
    resourceType: "app",
    handle: "app-ui",
    group: "aptible-deploy",
    id: "54710",
    dependsOn: ["63799", "9234", "63798", "5415"],
  },
];

const iconProps: IconProps = {
  color: "#FDF8F0", // off-white
};

const appIconUri = iconToDataUri(<IconBox {...iconProps} />);
const databaseIconUri = iconToDataUri(<IconCylinder {...iconProps} />);
const externalIconUri = iconToDataUri(<IconGlobe {...iconProps} />);

const graphPadding = 50;

export function ResourceGraphPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [selectedId, setSelectedId] = useState("");
  const selected = nodes.find((node) => node.id === selectedId);
  const [cy, setCy] = useState<cytoscape.Core>();
  const [layouts, setLayouts] = useState<Record<string, cytoscape.Layouts>>({});
  const [selectedLayoutId, setSelectedLayoutId] =
    useState<string>("cose-bilkent");
  const selectedLayout: cytoscape.Layouts | undefined =
    layouts[selectedLayoutId];
  const layoutOptions = Object.keys(layouts).map((k) => ({
    label: k,
    value: k,
  }));

  const [selectedGraphNode, setSelectedGraphNode] =
    useState<cytoscape.NodeSingular>();
  const selectedNode = nodes.find((n) => n.id === selectedGraphNode?.id());

  let selectedUrl = null;
  if (selected?.resourceType === "app") {
    selectedUrl = appDetailUrl(selectedId);
  }
  if (selected?.resourceType === "database") {
    selectedUrl = databaseDetailUrl(selectedId);
  }

  const filteredNodes = nodes.filter((node) =>
    node.handle.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (cy == null) {
      return;
    }

    const envMap: Record<string, cytoscape.NodeDefinition> = {};
    const resources: cytoscape.NodeDefinition[] = [];
    let connections: cytoscape.EdgeDefinition[] = [];

    for (const node of nodes) {
      const env = node.group;

      if (env && envMap[env] == null) {
        envMap[env] = {
          data: {
            id: env,
            label: env,
          },
        };
      }

      resources.push({
        data: {
          id: node.id,
          label: node.handle,
          parent: env,
        },
        classes: [
          node.resourceType,
          ["healthy", "concerning", "unhealthy"][Math.floor(Math.random() * 3)],
        ],
      });

      connections = connections.concat(
        node.dependsOn.map((target) => ({
          data: {
            id: `${node.id}-${target}`,
            source: node.id,
            target: target,
          },
        })),
      );
    }

    cy.add(Object.values(envMap));
    cy.add(resources);
    cy.add(connections);

    const envKeys = Object.keys(envMap);
    const ciseClusters = resources
      .filter((node) => node.data.id && node.data.parent)
      .reduce((clusts: string[][], node) => {
        const i = envKeys.indexOf(node.data.parent as string);
        clusts[i] = (clusts[i] || []).concat([node.data.id as string]);

        return clusts;
      }, []);

    setLayouts({
      "cose-bilkent": cy.layout({
        name: "cose-bilkent",
        animate: "end",
        nodeDimensionsIncludeLabels: true,
        padding: graphPadding
      } as any),
      cise: cy.layout({
        name: "cise",
        nodeDimensionsIncludeLabels: true,
        animate: "end",
        clusters: ciseClusters,
        nodeSeparation: 150,
        idealInterClusterEdgeLengthCoefficient: 3,
      } as any),
      klay: cy.layout({
        name: "klay",
        animate: "end",
        nodeDimensionsIncludeLabels: true,
      } as any),
      circle: cy.layout({
        name: "circle",
        animate: "end",
        nodeDimensionsIncludeLabels: true,
      } as any),
    });

    cy.on("select", "node", (e) => {
      setSelectedGraphNode(e.target);
      e.cy.animate({
        center: {
          eles: e.target,
        },
      });
    });

    cy.on("unselect", (e) => {
      setSelectedGraphNode(undefined);
    });
  }, [cy]);

  useEffect(() => {
    selectedLayout?.run();
  }, [selectedLayout]);

  useEffect(() => {
    setSelectedId(selectedGraphNode?.id() || "");
  }, [selectedGraphNode]);

  const onCenter = () => {
    const selectedNode = cy?.nodes(":selected")[0];

    cy?.animate({
      center: {
        eles: selectedNode as any,
      },
      zoom: 1.5,
    });
  };

  return (

    <CytoscapeGraph className="grow" onClient={setCy}>
      <div
        className="flex flex-col absolute top-4 left-4"
        onFocus={() => setSearchFocused(true)}
        // Ignore blurring to children
        onBlur={(e) => e.currentTarget.contains(e.relatedTarget) || setSearchFocused(false)}
      >
        <InputSearch
          search={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div
          className={`max-h-10vh overflow-y-auto ${
            searchFocused ? "" : "hidden"
          }`}
        >
          {filteredNodes.map((node) => (
            <Button
              key={node.id}
              variant="white"
              size="lg"
              className="w-full"
              onClick={() => {
                cy?.nodes(':selected')?.unselect();
                cy?.getElementById(node.id)?.select();
              }}
            >
              {node.resourceType}: {node.handle}
            </Button>
          ))}
        </div>
      </div>

      {selected == null ? null : (
        <Box className="absolute right-4 top-4">
          <Group>
            <div>
              <b>Type:</b> {selected.resourceType}
            </div>
            <div>
              <b>Name:</b> {selected.handle}
            </div>
            {selectedUrl == null ? null : <Link to={selectedUrl}>Details</Link>}
          </Group>
        </Box>
      )}

      <Group className="flex-col-reverse absolute right-4 bottom-4">
        <ButtonIcon
          icon={<IconRefresh variant="sm" />}
          variant="white"
          onClick={() => selectedLayout?.run()}
        />
        <ButtonIcon
          icon={<IconEyeClosed variant="sm" />}
          variant="white"
          onClick={() => cy?.nodes(":parent")?.toggleClass("invisible-parent")}
        />
        <ButtonIcon
          icon={<IconFit variant="sm" />}
          onClick={() => cy?.animate({ fit: { padding: graphPadding } as any })}
        />
        {selectedGraphNode == null ? null : (
          <ButtonIcon icon={<IconTarget variant="sm" />} onClick={onCenter} />
        )}
      </Group>
    </CytoscapeGraph>
  );
}
