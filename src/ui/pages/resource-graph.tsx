import cytoscape from "cytoscape";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  ButtonIcon,
  CytoscapeGraph,
  FormGroup,
  Group,
  IconBox,
  IconCylinder,
  IconGlobe,
  IconProps,
  IconRefresh,
  Select,
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
    group: 'aptible-auth',
    dependsOn: ["118912", "auth-api-pg"],
  },
  {
    resourceType: "external",
    handle: "auth-api-pg",
    group: 'vpc-adfb16c4',
    id: "auth-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "auth-api-redis",
    group: 'aptible-auth',
    id: "118912",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "billing-api",
    group: 'aptible-billing',
    id: "9234",
    dependsOn: ["11681", "63799"],
  },
  {
    resourceType: "database",
    handle: "pg-billing",
    group: 'aptible-billing',
    id: "11681",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "deploy-api",
    group: 'aptible-deploy',
    id: "63798",
    dependsOn: ["118918", "deploy-api-pg", "63799"],
  },
  {
    resourceType: "external",
    handle: "deploy-api-pg",
    group: 'vpc-adfb16c4',
    id: "deploy-api-pg",
    dependsOn: [],
  },
  {
    resourceType: "database",
    handle: "deploy-api-redis",
    group: 'aptible-deploy',
    id: "118918",
    dependsOn: [],
  },
  {
    resourceType: "app",
    handle: "metrictunnel",
    group: 'aptible-util',
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
    group: 'aptible-deploy',
    id: "54710",
    dependsOn: ["63799", "9234", "63798", "5415"],
  },
];

const iconProps: IconProps = {
  color: "#FDF8F0" // off-white
}

const appIconUri = iconToDataUri(<IconBox {...iconProps} />)
const databaseIconUri = iconToDataUri(<IconCylinder {...iconProps} />)
const externalIconUri = iconToDataUri(<IconGlobe {...iconProps} />)

export function ResourceGraphPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [selectedId, setSelectedId] = useState("");
  const selected = nodes.find((node) => node.id === selectedId);
  const [cy, setCy] = useState<cytoscape.Core>();
  const [layouts, setLayouts] = useState<Record<string, cytoscape.Layouts>>({})
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('cose-bilkent')
  const selectedLayout = layouts[selectedLayoutId]
  const layoutOptions = Object.keys(layouts).map ((k) => ({
    label: k,
    value: k
  }));

  useEffect(() => {
    if (cy == null) {
      return;
    }

    const envMap: Record<string, cytoscape.NodeDefinition> = {}
    const resources: cytoscape.NodeDefinition[] = []
    let connections: cytoscape.EdgeDefinition[] = []

    for (const node of nodes) {
      const env = node.group;

      if (env && envMap[env] == null) {
        envMap[env] = {
          data: {
            id: env,
            label: env
          }
        }
      }

      resources.push({
        data: {
          id: node.id,
          label: node.handle,
          parent: env
        },
        classes: [node.resourceType, (['healthy', 'concerning', 'unhealthy'][Math.floor(Math.random() * 3)])],
      })

      connections = connections.concat(
        node.dependsOn.map((target) => ({
          data: {
            id: `${node.id}-${target}`,
            source: node.id,
            target: target
          }
        }))
      )
    }

    cy.add(Object.values(envMap));
    cy.add(resources);
    cy.add(connections);

    const envKeys = Object.keys(envMap)
    const ciseClusters = resources.filter((node) => node.data.id && node.data.parent)
      .reduce((clusts: string[][], node) => {
        const i = envKeys.indexOf(node.data.parent as string)
        clusts[i] = (clusts[i] || []).concat([node.data.id as string])

        return clusts
      }, [])

    setLayouts({
      'cose-bilkent': cy.layout({
        name: 'cose-bilkent',
        animate: 'end',
        nodeDimensionsIncludeLabels: true
      } as any),
      cise: cy.layout({
        name: 'cise',
        nodeDimensionsIncludeLabels: true,
        animate: 'end',
        clusters: ciseClusters,
        nodeSeparation: 150,
        idealInterClusterEdgeLengthCoefficient: 3
      } as any),
      klay: cy.layout({
        name: 'klay',
        animate: 'end',
        nodeDimensionsIncludeLabels: true
      } as any),
      circle: cy.layout({
        name: 'circle',
        animate: 'end',
        nodeDimensionsIncludeLabels: true
      } as any)
    });
  }, [cy])

  useEffect(() => {
    selectedLayout?.run();
  }, [selectedLayout]);

  return (
    <Group variant="horizontal" className="grow">
      <CytoscapeGraph className="grow" onClient={setCy} />
      <Group className="w-72 p-4 border border-gray-200 rounded-md shadow-sm">
        <FormGroup htmlFor="" label="Layout">
          <Select options={layoutOptions} onSelect={(o) => setSelectedLayoutId(o.value)} />
        </FormGroup>
        <ButtonIcon variant="white" icon={<IconRefresh />} onClick={() => selectedLayout.run()}>Shuffle</ButtonIcon>
        <Button variant="white" onClick={() => cy?.nodes(':parent')?.toggleClass('invisible-parent')}>Toggle Groups</Button>
        <Button variant="white" onClick={() => cy?.fit(undefined, 10)}>Fit</Button>
      </Group>
    </Group>
  )
}
