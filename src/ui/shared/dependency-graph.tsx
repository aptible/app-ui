import { fetchEdgesByResource } from "@app/deploy/edge";
import { selectEdgesForResource } from "@app/deploy/edge";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import type { ResourceItem } from "@app/search";
import type { DeployEdge } from "@app/types";
import Dagre from "@dagrejs/dagre";
import {
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

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

  // decorate nodes with handle, type, etc
  // custom edge with labels, edge library

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ReactFlowProvider>
        <CenterGraph nodes={layouted.nodes} />
        <ReactFlow nodes={layouted.nodes} edges={layouted.edges} />
      </ReactFlowProvider>
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
      width: node.measured?.width ?? 50,
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
    edges,
  };
};

const generateGraphId = (resourceType: string, resourceId: string): string => {
  return `${resourceType}-${resourceId}`;
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

  let currentY = 100;
  const yStep = 100;
  for (const nodeId of nodeIds) {
    // decorate node with handle, type, etc
    nodes.push({
      id: nodeId,
      data: { label: nodeId },
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
  }));
};

const CenterGraph = ({ nodes }: { nodes: Node[] }) => {
  const { fitView } = useReactFlow();
  fitView({ padding: 1.0, duration: 0 });

  return null;
};
