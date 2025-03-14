import { selectCustomResourceById } from "@app/deploy/custom-resource";
import { fetchEdgesByResource } from "@app/deploy/edge";
import { selectEdgesForResource } from "@app/deploy/edge";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import type { ResourceItem } from "@app/search";
import type { DeployEdge } from "@app/types";
import Dagre from "@dagrejs/dagre";
import {
  type Edge,
  Handle,
  type Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { customResourceDetailUrl } from "@app/routes";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { IconBox, IconCloud, IconCylinder } from "./icons";

interface DependencyGraphProps {
  resourceItem: ResourceItem;
}

interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

const graphDirections = {
  TopToBottom: "TB",
  BottomToTop: "BT",
  LeftToRight: "LR",
  RightToLeft: "RL",
} as const;

export const DependencyGraph = ({ resourceItem }: DependencyGraphProps) => {
  const nodeTypes = useMemo(() => {
    return { resource: ResourceNode };
  }, []);

  useQuery(
    fetchEdgesByResource({
      resourceId: resourceItem.id,
      resourceType: resourceItem.type,
    }),
  );

  const edges = useSelector((s) =>
    selectEdgesForResource(s, {
      resourceId: resourceItem.id,
      resourceType: resourceItem.type,
    }),
  );

  const graphNodes: Node[] = getAllNodes(resourceItem, edges);
  const graphEdges: Edge[] = getAllEdges(edges);
  const layouted = getLayoutedElements(graphNodes, graphEdges, {
    direction: graphDirections.TopToBottom,
  });

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ReactFlowProvider>
        <CenterGraph />
        <ReactFlow
          nodes={layouted.nodes}
          edges={layouted.edges}
          nodeTypes={nodeTypes}
        />
      </ReactFlowProvider>
    </div>
  );
};

const ResourceNode = ({
  data,
  isConnectable,
}: {
  data: { label: string; isRoot: boolean };
  isConnectable: boolean;
}) => {
  const { resourceType, resourceId } = parseGraphId(data.label);
  const ResourceComponent =
    resourceType === "custom_resource" ? CustomResourceNode : null;

  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div
        className={`w-64 text-xs px-3 py-2 shadow border rounded-lg ${
          data.isRoot
            ? "border-blue-300 bg-white"
            : "border-black-100 bg-gray-50"
        }`}
      >
        {ResourceComponent ? (
          <ResourceComponent id={resourceId} isRoot={data.isRoot} />
        ) : (
          data.label
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
};

const CustomResourceNode = ({
  id,
  isRoot,
}: { id: string; isRoot: boolean }) => {
  const resource = useSelector((s) => selectCustomResourceById(s, { id }));

  let icon = <IconCloud />;

  if (resource?.resourceType) {
    if (resource.resourceType.includes("database")) {
      icon = <IconCylinder />;
    } else if (resource.resourceType.includes("ecs")) {
      icon = <IconBox />;
    }
  }

  return (
    <div className="flex gap-x-2 items-center">
      <div className="flex w-6 h-6">{icon}</div>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
        {isRoot ? (
          <span className="">{resource?.handle}</span>
        ) : (
          <Link
            className="text-gray-500 underline hover:no-underline"
            to={customResourceDetailUrl(id)}
          >
            {resource?.handle}
          </Link>
        )}
      </div>
    </div>
  );
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: string },
): LayoutedElements => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 250,
      height: node.measured?.height ?? 50,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges: edges,
  };
};

const generateGraphId = (resourceType: string, resourceId: string): string => {
  return `${resourceType}-${resourceId}`;
};

const parseGraphId = (
  graphId: string,
): { resourceType: string; resourceId: string } => {
  const [resourceType, resourceId] = graphId.split("-");
  return { resourceType, resourceId };
};

const getAllNodeIds = (
  rootResource: ResourceItem,
  edges: DeployEdge[],
): string[] => {
  const nodeIds = new Set<string>();
  nodeIds.add(generateGraphId(rootResource.type, rootResource.id));

  for (const edge of edges) {
    nodeIds.add(
      generateGraphId(edge.sourceResourceType, edge.sourceResourceId),
    );
    nodeIds.add(
      generateGraphId(edge.destinationResourceType, edge.destinationResourceId),
    );
  }
  return Array.from(nodeIds);
};

const getAllNodes = (
  rootResource: ResourceItem,
  edges: DeployEdge[],
): Node[] => {
  const nodeIds = getAllNodeIds(rootResource, edges);
  const nodes: Node[] = [];
  const rootNodeId = generateGraphId(rootResource.type, rootResource.id);

  let currentY = 100;
  const yStep = 100;
  for (const nodeId of nodeIds) {
    nodes.push({
      id: nodeId,
      type: "resource",
      data: { label: nodeId, isRoot: nodeId === rootNodeId },
      position: { x: 0, y: currentY },
    });
    currentY += yStep;
  }
  return nodes;
};

const getAllEdges = (edges: DeployEdge[]): Edge[] => {
  return edges.map((edge) => ({
    id: edge.id,
    source: generateGraphId(edge.sourceResourceType, edge.sourceResourceId),
    target: generateGraphId(
      edge.destinationResourceType,
      edge.destinationResourceId,
    ),
    animated: true,
    data: { label: edge.relationshipType },
  }));
};

const CenterGraph = () => {
  const { fitView } = useReactFlow();
  const widthSelector = (state: { width: any }) => state.width;
  const heightSelector = (state: { height: any }) => state.height;
  const reactFlowWidth = useStore(widthSelector);
  const reactFlowHeight = useStore(heightSelector);
  const fitOptions = { padding: 0.75, duration: 0 };

  useEffect(() => {
    fitView(fitOptions);
  }, [reactFlowWidth, reactFlowHeight]);

  // Wait for the graph to be rendered before fitting the view
  setTimeout(() => {
    fitView(fitOptions);
  }, 1);

  return null;
};
