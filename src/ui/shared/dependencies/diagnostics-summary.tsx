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

interface DegradedResource {
  resourceId: string;
  resourceType: string;
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

  const degradedResources: DegradedResource[] = useMemo(() => {
    return getResourcesFromRankedPlots(dashboardContents);
  }, [dashboardContents]);

  const resourceItem: ResourceItem = {
    type: convertResourceTypeToEdgeType(dashboard.resourceType),
    id: dashboard.resourceId,
  };
  const graphNodes: Node[] = getAllNodes(resourceItem, edges);
  const graphEdges: Edge[] = getAllEdgesForDashboard(edges, degradedResources);

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

const getResourcesFromRankedPlots = (
  dashboardContents: DashboardContents,
): DegradedResource[] => {
  const resources: DegradedResource[] = [];

  if (Array.isArray(dashboardContents.ranked_plots)) {
    for (const plot of dashboardContents.ranked_plots) {
      const resourceIdString = plot.resource_id.toString();

      if (dashboardContents.resources[resourceIdString]) {
        const resource = dashboardContents.resources[resourceIdString];
        resources.push({
          resourceId: resourceIdString,
          resourceType: resource.type,
        });
      }
    }
  }

  return resources;
};

const getAllEdgesForDashboard = (
  edges: DeployEdge[],
  degradedResources: DegradedResource[],
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

      const degradedResource = degradedResources.find(
        (r) =>
          r.resourceType === edge.destinationResourceType &&
          r.resourceId === edge.destinationResourceId,
      );

      if (degradedResource) {
        edgeData.type = "degraded";
      }

      return edgeData;
    });
};
