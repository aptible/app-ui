import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { fetchOperationsByOrgId } from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { schema } from "@app/schema";
import { formatDistanceToNow } from "date-fns";

export const ActivityFeed = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const org = useSelector(selectOrganizationSelected);
  const operations = useSelector(schema.operations.selectTableAsList);
  const apps = useSelector(schema.apps.selectTableAsList);
  const services = useSelector(schema.services.selectTableAsList);
  const databases = useSelector(schema.databases.selectTableAsList);

  // Get the first 5 operations, sorted by date, with resource names
  const recentOperations = operations
    ?.filter(operation => {
      // Debug: Log all operation types and resource IDs to understand the data
      console.log('🔍 Operation debug:', {
        type: operation.type,
        resourceId: operation.resourceId,
        resourceType: operation.resourceType,
        status: operation.status
      });
      
      // Only filter out ephemeral_session operations for now
      if (operation.resourceId?.toLowerCase().includes('ephemeral_session')) {
        return false;
      }
      
      // Filter out poll operations
      if (operation.type === 'poll') {
        return false;
      }
      
      return true;
    })
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    ?.slice(0, 5)
    ?.map(operation => {
      let resourceName = operation.resourceId;
      
      // Get actual resource name from the appropriate collection
      if (operation.resourceType === 'app' && apps) {
        const app = apps.find((app: any) => app.id === operation.resourceId);
        resourceName = app?.handle || operation.resourceId;
      } else if (operation.resourceType === 'service' && services) {
        const service = services.find((service: any) => service.id === operation.resourceId);
        resourceName = service?.handle || operation.resourceId;
      } else if (operation.resourceType === 'database' && databases) {
        const database = databases.find((db: any) => db.id === operation.resourceId);
        resourceName = database?.handle || operation.resourceId;
      }

      return {
        ...operation,
        resourceName,
        actualResourceType: operation.resourceType
      };
    }) || [];

  // Debug logging for processed operations
  console.log('🏠 Activity Feed - Recent Operations:', recentOperations.map(op => ({
    type: op.type,
    resourceName: op.resourceName,
    resourceType: op.actualResourceType,
    status: op.status,
    user: op.userName,
    date: op.updatedAt,
    id: op.id
  })));

  const fetchRecentOperations = async (isRefresh = false) => {
    if (!org?.id) return;
    
    if (isRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('🔍 Fetching operations with params:', {
        id: org.id,
        page: 1,
        operationType: 'all',
        operationStatus: 'all',
        resourceType: 'all'
      });
      
      await dispatch(fetchOperationsByOrgId({
        id: org.id,
        page: 1,
        operationType: 'all',
        operationStatus: 'all',
        resourceType: 'all'
      }));
      
      console.log('📊 Operations after fetch:', operations?.slice(0, 10));
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!org?.id) {
      setIsLoading(false);
      setHasInitiallyFetched(true);
      return;
    }

    const initialFetch = async () => {
      setIsLoading(true);
      await fetchRecentOperations();
      setIsLoading(false);
      setHasInitiallyFetched(true);
    };

    initialFetch();

    // Set up 15-second refresh interval
    const interval = setInterval(() => {
      console.log('🔄 Refreshing activity feed...');
      fetchRecentOperations(true); // Pass true to indicate this is a refresh
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [dispatch, org?.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '—';
    }
  };

  const getStatusStyle = (status: string) => {
    console.log('🎨 Status styling for:', status);
    switch (status?.toUpperCase()) {
      case 'DONE':
      case 'SUCCEEDED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'RUNNING':
      case 'STARTED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        console.log('🎨 Using default styling for status:', status);
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.toUpperCase() === 'SUCCEEDED' ? 'DONE' : status.toUpperCase();
  };

  const getOperationTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deploy':
        return 'bg-blue-100 text-blue-800';
      case 'scale':
        return 'bg-green-100 text-green-800';
      case 'restart':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const formatResourceType = (resourceType: string) => {
    if (!resourceType) return '—';
    const lowerType = resourceType.toLowerCase();
    if (lowerType === 'vhost') {
      return 'Endpoint';
    }
    return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Activity Feed</h2>
          {isRefreshing && (
            <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>
        <Link 
          to="/activity"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        {isLoading || !hasInitiallyFetched ? (
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-full justify-center ${getOperationTypeStyle(operation.type)}`}>
                      {operation.type || '—'}
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
                      {operation.userName || '—'}
                    </div>
                  </div>
                  
                  {/* Status Badge - Wider */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium w-full justify-center ${getStatusStyle(operation.status)}`}>
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
          <div className="p-6 text-center text-gray-500">
            No recent activity found
          </div>
        )}
      </div>
    </div>
  );
}; 