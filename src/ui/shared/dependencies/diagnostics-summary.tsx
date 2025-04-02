import { selectAppsByOrgAsList } from "@app/deploy/app";
import { selectDatabasesByOrgAsList } from "@app/deploy/database";
import { fetchDependencyEdgesByResource } from "@app/deploy/edge";
import { selectEdgesForResource } from "@app/deploy/edge";
import { useQuery } from "@app/react";
import { useSelector } from "@app/react";
import type { ResourceItem } from "@app/search";
import type {
  DeployApp,
  DeployDashboard,
  DeployDatabase,
  DeployEdge,
  DeployEdgeType,
} from "@app/types";
import type { Edge, Node } from "@xyflow/react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { DependencyGraph, generateGraphId, getAllNodes } from "./graph";

interface DiagnosticsSummaryDependencyGraphProps {
  dashboard: DeployDashboard;
}

interface DashboardData {
  ranked_plots: {
    title: string;
    description: string;
  }[];
}

interface DegradedResource {
  resourceId: string;
  resourceType: string;
  handle: string;
  description: string;
}

export const DiagnosticsSummaryDependencyGraph = ({
  dashboard,
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

  const apps = useSelector((s) => selectAppsByOrgAsList(s));
  const databases = useSelector((s) => selectDatabasesByOrgAsList(s));

  const degradedResources: DegradedResource[] = useMemo(() => {
    const dashboardData: DashboardData = dashboard.data as DashboardData;
    return getResourcesFromRankedPlots(
      dashboard,
      dashboardData.ranked_plots,
      apps,
      databases,
    );
  }, [apps, databases, dashboard]);

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
  dashboard: DeployDashboard,
  rankedPlots: DashboardData["ranked_plots"],
  apps: DeployApp[],
  databases: DeployDatabase[],
): DegradedResource[] => {
  const resources: DegradedResource[] = [];

  for (const plot of rankedPlots) {
    const titleTokens = plot.title.split(" in ");
    const resourceDescription = titleTokens[titleTokens.length - 1];
    const [resourceType, resourceName] = resourceDescription.split(" ");

    if (resourceType === "app") {
      const app = apps.find((app) => app.handle === resourceName);
      if (
        app &&
        !(
          dashboard.resourceType === "App" &&
          dashboard.resourceId.toString() === app.id
        )
      ) {
        resources.push({
          resourceId: app.id,
          resourceType: "app",
          handle: app.handle,
          description: plot.description,
        });
      }
    } else if (resourceType === "database") {
      const database = databases.find((db) => db.handle === resourceName);
      if (database) {
        resources.push({
          resourceId: database.id,
          resourceType: "database",
          handle: database.handle,
          description: plot.description,
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
