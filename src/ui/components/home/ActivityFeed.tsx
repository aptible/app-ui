import { cancelOrgOperationsPoll, pollOrgOperations } from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePaginatedOpsByOrgId } from "../../hooks/use-paginate-operations";
import { usePoller } from "../../hooks/use-poller";

export const ActivityFeed = () => {
  const org = useSelector(selectOrganizationSelected);

  // Use polling just like the /activity page
  const poller = useMemo(
    () => pollOrgOperations({ orgId: org?.id || "" }),
    [org?.id],
  );
  const cancel = useMemo(() => cancelOrgOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  // Get paginated data (same as activity page)
  const paginated = usePaginatedOpsByOrgId(org?.id || "");

  // Get the first 5 operations from paginated data (polling automatically keeps it fresh)
  const recentOperations =
    paginated.data
      ?.filter((operation) => {
        // Filter out ephemeral_session operations
        if (operation.resourceId?.toLowerCase().includes("ephemeral_session")) {
          return false;
        }

        // Filter out poll operations
        if (operation.type === "poll") {
          return false;
        }

        return true;
      })
      ?.slice(0, 5) // Get latest 5
      ?.map((operation) => {
        // The data from selectActivityByIdsForTable already has resourceHandle populated
        const resourceName = operation.resourceHandle || operation.resourceId;

        return {
          ...operation,
          resourceName,
          actualResourceType: operation.resourceType,
        };
      }) || [];

  console.log(
    "🏠 Activity Feed - Recent Operations (polling):",
    recentOperations.length,
    "operations",
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "—";
    }
  };

  const getStatusStyle = (status: string) => {
    console.log("🎨 Status styling for:", status);
    switch (status?.toUpperCase()) {
      case "DONE":
      case "SUCCEEDED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "RUNNING":
      case "STARTED":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        console.log("🎨 Using default styling for status:", status);
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "";
    return status.toUpperCase() === "SUCCEEDED" ? "DONE" : status.toUpperCase();
  };

  const getOperationTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "deploy":
        return "bg-blue-100 text-blue-800";
      case "scale":
        return "bg-green-100 text-green-800";
      case "restart":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const formatResourceType = (resourceType: string) => {
    if (!resourceType) return "—";
    const lowerType = resourceType.toLowerCase();
    if (lowerType === "vhost") {
      return "Endpoint";
    }
    return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Activity Feed</h2>
        <Link
          to="/activity"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="h-96 overflow-y-auto">
          {paginated.isLoading ? (
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Operation Type Badge Skeleton */}
                    <div className="col-span-1">
                      <div className="h-5 w-full bg-gray-200 rounded-full animate-pulse" />
                    </div>

                    {/* Resource Info Skeleton */}
                    <div className="col-span-4">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* User Skeleton */}
                    <div className="col-span-3">
                      <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* Status Badge Skeleton */}
                    <div className="col-span-2">
                      <div className="h-5 w-full bg-gray-200 rounded-full animate-pulse" />
                    </div>

                    {/* Time Skeleton */}
                    <div className="col-span-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOperations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentOperations.map((operation) => (
                <Link
                  key={operation.id}
                  to={`/operations/${operation.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Operation Type Badge - Narrower */}
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-full justify-center ${getOperationTypeStyle(operation.type)}`}
                      >
                        {operation.type || "—"}
                      </span>
                    </div>

                    {/* Resource Info - Flexible width */}
                    <div className="col-span-4">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {operation.resourceName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {formatResourceType(operation.actualResourceType)}
                      </div>
                    </div>

                    {/* User - Fixed width */}
                    <div className="col-span-3">
                      <div className="text-sm text-gray-600 truncate text-left">
                        {operation.userName || "—"}
                      </div>
                    </div>

                    {/* Status Badge - Wider */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium w-full justify-center ${getStatusStyle(operation.status)}`}
                      >
                        {formatStatus(operation.status)}
                      </span>
                    </div>

                    {/* Time - Slightly narrower */}
                    <div className="col-span-2 text-right">
                      <div className="text-sm text-gray-500 truncate">
                        {formatDate(operation.updatedAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                No recent activity found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
