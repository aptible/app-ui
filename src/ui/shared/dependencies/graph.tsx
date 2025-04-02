import type { ResourceItem } from "@app/search";
import type { DeployEdge } from "@app/types";
import Dagre from "@dagrejs/dagre";
import {
  Controls,
  type DefaultEdgeOptions,
  type Edge,
  Handle,
  type Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { AppNode, DatabaseNode } from "./aptible-nodes";
import { CustomResourceNode } from "./custom-nodes";
import { DegradedEdge } from "./edges";
import { type ResourceNodeProps, StandardNode } from "./node";
interface DependencyGraphProps {
  nodes: Node[];
  edges: Edge[];
  fitView?: boolean;
}

interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

interface NodeProps {
  data: { label: string; isRoot: boolean };
  isConnectable: boolean;
}

type ResourceType = "custom_resource" | "database" | "app";

const graphDirections = {
  TopToBottom: "TB",
  BottomToTop: "BT",
  LeftToRight: "LR",
  RightToLeft: "RL",
} as const;

export const DependencyGraph = ({
  nodes,
  edges,
  fitView = false,
}: DependencyGraphProps) => {
  // Custom renderers
  const nodeTypes = useMemo(() => {
    return { resourceItem: ResourceItemNode };
  }, []);

  const edgeTypes = useMemo(() => {
    return { degraded: DegradedEdge };
  }, []);

  // Compute layout
  const laidOut = calculateLayout(nodes, edges, {
    direction: graphDirections.TopToBottom,
  });

  const edgeOptions: DefaultEdgeOptions = {
    deletable: false,
    selectable: false,
    focusable: false,
  };

  return (
    <div
      style={{ width: "100%", height: "400px" }}
      className="border rounded-lg"
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={laidOut.nodes}
          edges={laidOut.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={fitView}
          defaultEdgeOptions={edgeOptions}
          edgesReconnectable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          preventScrolling={false}
        >
          <Controls position="top-right" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

const resourceComponentMap: Record<
  ResourceType,
  (props: ResourceNodeProps) => JSX.Element
> = {
  custom_resource: CustomResourceNode,
  database: DatabaseNode,
  app: AppNode,
};

const ResourceItemNode = ({ data, isConnectable }: NodeProps) => {
  const { resourceType, resourceId } = parseGraphId(data.label);
  const ResourceComponent =
    resourceComponentMap[resourceType as ResourceType] || null;

  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      {ResourceComponent ? (
        <ResourceComponent id={resourceId} isRoot={data.isRoot} />
      ) : (
        <StandardNode isRoot={data.isRoot}>{data.label}</StandardNode>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
};

const calculateLayout = (
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

  const computedNodes = nodes.map((node) => {
    const position = g.node(node.id);
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    const x = position.x - (node.measured?.width ?? 0) / 2;
    const y = position.y - (node.measured?.height ?? 0) / 2;

    return { ...node, position: { x, y } };
  });

  return {
    nodes: computedNodes,
    edges: edges,
  };
};

export const generateGraphId = (
  resourceType: string,
  resourceId: string,
): string => {
  return `${resourceType}-${resourceId}`;
};

const parseGraphId = (
  graphId: string,
): { resourceType: string; resourceId: string } => {
  const [resourceType, resourceId] = graphId.split("-");
  return { resourceType, resourceId };
};

export const getAllNodeIds = (
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

export const getAllNodes = (
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
      type: "resourceItem",
      data: { label: nodeId, isRoot: nodeId === rootNodeId },
      position: { x: 0, y: currentY },
    });
    currentY += yStep;
  }

  return nodes;
};
