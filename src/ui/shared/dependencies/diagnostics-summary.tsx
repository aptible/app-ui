import type { DashboardContents } from "@app/aptible-ai";
import { fetchDependencyEdgesByResource } from "@app/deploy/edge";
import { selectEdgesForResource } from "@app/deploy/edge";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import type { ResourceItem } from "@app/search";
import type { DeployDashboard, DeployEdge, DeployEdgeType } from "@app/types";
import type { Edge, Node } from "@xyflow/react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { DependencyGraph, generateGraphId, getAllNodes } from "./graph";

interface DiagnosticsSummaryDependencyGraphProps {
  dashboard: DeployDashboard;
  dashboardContents: DashboardContents;
}

interface DegradedEdge {
  edgeId: string;
  label: string;
}

export const DiagnosticsSummaryDependencyGraph = ({
  dashboard,
  dashboardContents,
}: DiagnosticsSummaryDependencyGraphProps) => {
  const now = useMemo(
    () => DateTime.now().minus({ minutes: DateTime.local().offset }),
    [],
  );

  const { isSuccess: isEdgesLoaded } = useQuery(
    fetchDependencyEdgesByResource({
      resourceId: dashboard.resourceId,
      resourceType: convertResourceTypeToEdgeType(dashboard.resourceType),
      timeRangeStart: now.toUTC(0, { keepLocalTime: true }).toISO(),
    }),
  );

  const edges = useSelector((s) =>
    selectEdgesForResource(s, {
      resourceId: dashboard.resourceId.toString(),
      resourceType: convertResourceTypeToEdgeType(dashboard.resourceType),
    }),
  );

  const degradedEdges: DegradedEdge[] = useMemo(() => {
    return getDegradedEdges(dashboardContents);
  }, [dashboardContents]);

  const resourceItem: ResourceItem = {
    type: convertResourceTypeToEdgeType(dashboard.resourceType),
    id: dashboard.resourceId,
  };
  const graphNodes: Node[] = getAllNodes(resourceItem, edges);
  const graphEdges: Edge[] = getAllEdgesForDashboard(edges, degradedEdges);

  return (
    <>
      {isEdgesLoaded && (
        <DependencyGraph nodes={graphNodes} edges={graphEdges} fitView={true} />
      )}
      {!isEdgesLoaded && (
        <div className="text-center text-gray-500">Loading...</div>
      )}
    </>
  );
};

const convertResourceTypeToEdgeType = (
  resourceType: string,
): DeployEdgeType => {
  switch (resourceType) {
    case "App":
      return "app";
    case "Database":
      return "database";
    case "CustomResource":
      return "custom_resource";
    default:
      return "app";
  }
};

const getDegradedEdges = (
  dashboardContents: DashboardContents,
): DegradedEdge[] => {
  const edges: DegradedEdge[] = [];

  if (Array.isArray(dashboardContents.ranked_plots)) {
    for (const plot of dashboardContents.ranked_plots) {
      const resourceIdString = plot.resource_id.toString();

      if (dashboardContents.resources[resourceIdString]) {
        const resource = dashboardContents.resources[resourceIdString];

        edges.push({
          edgeId: resource.edge_id.toString(),
          label: plot.analysis ? plot.analysis : "Anomaly found",
        });
      }
    }
  }

  return edges;
};

const getAllEdgesForDashboard = (
  edges: DeployEdge[],
  degradedEdges: DegradedEdge[],
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
      };

      const degradedEdge = degradedEdges.find((e) => e.edgeId === edge.id);

      if (degradedEdge) {
        edgeData.type = "degraded";
        edgeData.label = degradedEdge.label;
      }

      return edgeData;
    });
};
