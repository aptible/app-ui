import type { DashboardContents } from "@app/aptible-ai";
import {
  fetchDashboardsWithData,
  selectDashboardsByResourceAsList,
} from "@app/deploy/dashboard";
import { fetchDependencyEdgesByResource } from "@app/deploy/edge";
import { selectEdgesForResource } from "@app/deploy/edge";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import type { ResourceItem } from "@app/search";
import type { DeployDashboard, DeployEdge } from "@app/types";
import type { Edge, Node } from "@xyflow/react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import type { AnomalyHistory } from "./edges";
import { DependencyGraph, generateGraphId, getAllNodeIds } from "./graph";

interface SingleResourceDependencyGraphProps {
  resourceItem: ResourceItem;
}

interface DegradedEdges {
  [edgeId: string]: AnomalyHistory;
}

const OBSERVATIONS_CUTOFF_DAYS = 7;
const OBSERVATIONS_PER_EDGE_MAX = 3;

export const SingleResourceDependencyGraph = ({
  resourceItem,
}: SingleResourceDependencyGraphProps) => {
  const now = useMemo(
    () => DateTime.now().minus({ minutes: DateTime.local().offset }),
    [],
  );
  const observationsCutoff = now
    .minus({ days: OBSERVATIONS_CUTOFF_DAYS })
    .toUTC(0, { keepLocalTime: true })
    .toISO();

  const { isSuccess: isDashboardsLoaded } = useQuery(fetchDashboardsWithData());
  const dashboards = useSelector((s) =>
    selectDashboardsByResourceAsList(s, {
      resourceId: resourceItem.id,
      resourceType: "CustomResource",
      timeRangeStart: observationsCutoff,
    }),
  );

  const { isSuccess: isEdgesLoaded } = useQuery(
    fetchDependencyEdgesByResource({
      resourceId: resourceItem.id,
      resourceType: resourceItem.type,
      timeRangeStart: now.toUTC(0, { keepLocalTime: true }).toISO(),
    }),
  );

  const edges = useSelector((s) =>
    selectEdgesForResource(s, {
      resourceId: resourceItem.id,
      resourceType: resourceItem.type,
    }),
  );

  const degradedEdges = getDegradedEdges(dashboards);
  const graphNodes: Node[] = getAllNodes(resourceItem, edges);
  const graphEdges: Edge[] = getAllEdges(edges, degradedEdges);

  return (
    <>
      {isEdgesLoaded && isDashboardsLoaded && (
        <DependencyGraph nodes={graphNodes} edges={graphEdges} fitView={true} />
      )}
    </>
  );
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
      type: "resourceItem",
      data: { label: nodeId, isRoot: nodeId === rootNodeId },
      position: { x: 0, y: currentY },
    });
    currentY += yStep;
  }

  return nodes;
};

const getDegradedEdges = (dashboards: DeployDashboard[]): DegradedEdges => {
  const degradedEdges: DegradedEdges = {};

  for (const dashboard of dashboards) {
    const dashboardContents = dashboard.data as DashboardContents;

    if (Array.isArray(dashboardContents.ranked_plots)) {
      for (const plot of dashboardContents.ranked_plots) {
        if (dashboardContents.resources[plot.resource_label]) {
          const resource = dashboardContents.resources[plot.resource_label];
          if (!resource.edge_id) {
            continue;
          }
          const edgeId = resource.edge_id.toString();

          if (!degradedEdges[edgeId]) {
            degradedEdges[edgeId] = {};
          }

          degradedEdges[edgeId][dashboard.id] = {
            label: plot.analysis ? plot.analysis : "Anomaly found",
            observationTimestamp: dashboard.observationTimestamp,
          };
        }
      }
    }
  }

  return degradedEdges;
};

const getAllEdges = (
  edges: DeployEdge[],
  degradedEdges: DegradedEdges,
): Edge[] => {
  return edges
    .filter((edge) => edge.sourceResourceId !== edge.destinationResourceId)
    .map((edge) => {
      const edgeData: Edge = {
        id: edge.id,
        source: generateGraphId(edge.sourceResourceType, edge.sourceResourceId),
        target: generateGraphId(
          edge.destinationResourceType,
          edge.destinationResourceId,
        ),
        animated: true,
        data: { label: edge.relationshipType },
        // Add visible label to all edges with formatted relationship type
        label: edge.relationshipType.replace(/_/g, " "),
      };

      if (degradedEdges[edge.id]) {
        edgeData.type = "anomalyHistory";

        const anomalyHistory: AnomalyHistory = {};

        const sortedAnomalies = Object.entries(degradedEdges[edge.id])
          .sort(
            ([, a], [, b]) =>
              new Date(b.observationTimestamp).getTime() -
              new Date(a.observationTimestamp).getTime(),
          )
          .slice(0, OBSERVATIONS_PER_EDGE_MAX);

        for (const [dashboardId, anomalyData] of sortedAnomalies) {
          anomalyHistory[dashboardId] = anomalyData;
        }

        edgeData.data = {
          ...edgeData.data,
          anomalyHistory,
          // Ensure the label is also passed in data for edge components
          label: edge.relationshipType,
        };
      }

      return edgeData;
    });
};
