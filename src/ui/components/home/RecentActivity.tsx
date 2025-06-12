import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectApps,
  selectServices,
  selectDatabases,
  fetchOperationsByOrgId,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { schema } from "@app/schema";
import { createSelector } from "@app/fx";
import { formatDistanceToNow } from "date-fns";
import type { WebState } from "@app/schema";

interface ProcessedActivity {
  id: string;
  type: 'deploy' | 'apps:scale' | 'db:restart' | 'Failed Op';
  resourceName: string;
  resourceId: string;
  resourceType: string;
  status: string;
  date: string;
  user: string;
}

// Single unified selector that returns all 4 activity types
const selectRecentActivities = createSelector(
  [
    schema.operations.selectTableAsList,
    schema.apps.selectTableAsList,
    schema.services.selectTableAsList,
    schema.databases.selectTableAsList,
    (state: WebState) => state,
  ],
  (operations, apps, services, databases, state) => {
    if (!operations || !apps || !services || !databases) return null;

    // Helper function to get resource name and ensure correct resource type
    const getResourceInfo = (operation: any) => {
      let resourceName = operation.resourceId;
      let actualResourceType = operation.resourceType;

      if (operation.resourceType === 'app') {
        const app = apps.find(app => app.id === operation.resourceId);
        resourceName = app?.handle || operation.resourceId;
      } else if (operation.resourceType === 'service') {
        const service = services.find(service => service.id === operation.resourceId);
        resourceName = service?.handle || operation.resourceId;
      } else if (operation.resourceType === 'database') {
        const database = databases.find(db => db.id === operation.resourceId);
        resourceName = database?.handle || operation.resourceId;
      }

      return { resourceName, actualResourceType };
    };

    // Sort all operations by date first
    const sortedOperations = operations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Find most recent of each type based on actual operation types found
    const activities: { [key: string]: ProcessedActivity | null } = {
      deploy: null,
      'apps:scale': null,
      'db:restart': null,
      'Failed Op': null,
    };

    for (const operation of sortedOperations) {
      const { resourceName, actualResourceType } = getResourceInfo(operation);

      // Deploy operations (type: "Deploy" on apps)
      if (!activities.deploy && 
          String(operation.type) === 'Deploy' &&
          actualResourceType === 'app') {
        activities.deploy = {
          id: operation.id,
          type: 'deploy',
          resourceName,
          resourceId: operation.resourceId,
          resourceType: actualResourceType,
          status: operation.status,
          date: operation.updatedAt,
          user: operation.userName || 'unknown',
        };
      }

      // Scale operations (type: "Scale" on services)
      if (!activities['apps:scale'] && 
          String(operation.type) === 'Scale' &&
          actualResourceType === 'service') {
        activities['apps:scale'] = {
          id: operation.id,
          type: 'apps:scale',
          resourceName,
          resourceId: operation.resourceId,
          resourceType: actualResourceType,
          status: operation.status,
          date: operation.updatedAt,
          user: operation.userName || 'unknown',
        };
      }

      // Database restart operations (type: "restart" on databases)
      if (!activities['db:restart'] && 
          operation.type === 'restart' &&
          actualResourceType === 'database') {
        activities['db:restart'] = {
          id: operation.id,
          type: 'db:restart',
          resourceName,
          resourceId: operation.resourceId,
          resourceType: actualResourceType,
          status: operation.status,
          date: operation.updatedAt,
          user: operation.userName || 'unknown',
        };
      }

      // Failed operations (status: "failed", any type, any resource)
      if (!activities['Failed Op'] && operation.status === 'failed') {
        activities['Failed Op'] = {
          id: operation.id,
          type: 'Failed Op',
          resourceName,
          resourceId: operation.resourceId,
          resourceType: actualResourceType,
          status: operation.status,
          date: operation.updatedAt,
          user: operation.userName || 'unknown',
        };
      }

      // Break early if we have all 4 types
      if (Object.values(activities).every(activity => activity !== null)) {
        break;
      }
    }

    return activities;
  }
);

export const RecentActivity = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartedFetching, setHasStartedFetching] = useState(false);
  const org = useSelector(selectOrganizationSelected);
  
  // Get base data to check if it's loaded
  const operations = useSelector(schema.operations.selectTableAsList);
  const apps = useSelector(selectApps);
  const services = useSelector(selectServices);
  const databases = useSelector(selectDatabases);
  
  // Get the processed activities from our unified selector
  const activities = useSelector(selectRecentActivities);

  // Check if base data is ready
  const isBaseDataReady = Boolean(operations && apps && services && databases);
  
  // Memoize the processed activity data to avoid recalculation
  const memoizedActivities = useMemo(() => {
    if (!activities) return null;
    return activities;
  }, [activities]);

  // Update loading state based on actual data in store
  useEffect(() => {
    if (!hasStartedFetching) return;
    
    if (isBaseDataReady && operations) {
      console.log(`🔍 Checking data: ${operations.length} operations loaded`);
      
      if (operations.length > 0) {
        // Debug: Check what operation types we have
        const operationTypes = operations.map(op => op.type).filter(Boolean);
        const uniqueTypes = [...new Set(operationTypes)];
        console.log(`📊 Operation types found: ${uniqueTypes.join(', ')}`);
        
        // Debug: Check selector results
        if (activities) {
          const foundActivities = Object.entries(activities)
            .filter(([_, activity]) => activity !== null)
            .map(([type, _]) => type);
          console.log(`🎯 Activities found by selector: ${foundActivities.join(', ') || 'none'}`);
        }
        
        // Wait for selector to find at least one activity OR timeout after reasonable time
        if (activities && Object.values(activities).some(activity => activity !== null)) {
          console.log('✅ Activities found by selector - stopping loading');
          setIsLoading(false);
        } else {
          // We have operations but selector hasn't found activities yet - wait a bit more
          const timer = setTimeout(() => {
            console.log('⏰ Timeout waiting for selector to find activities');
            setIsLoading(false);
          }, 3000); // 3 second timeout
          
          return () => clearTimeout(timer);
        }
      } else {
        // No operations found - wait longer for empty state
        const timer = setTimeout(() => {
          console.log('⏰ Timeout reached, no operations found');
          setIsLoading(false);
        }, 5000); // 5 second timeout for truly empty state
        
        return () => clearTimeout(timer);
      }
    }
  }, [hasStartedFetching, isBaseDataReady, operations, activities]);

  // Simple API call to get ~500 operations on mount
  useEffect(() => {
    if (!org?.id) return;

    let isMounted = true;

    const fetchInitialOperations = async () => {
      if (!isMounted) return;
      
      setHasStartedFetching(true);
      console.log('🚀 Fetching recent operations (mixed strategy):', new Date().toISOString());

      try {
        // Strategy: Fetch general operations + specific types for better coverage
        const generalPages = 10; // Reduce general pages
        const specificOperationTypes = ['Deploy', 'Scale']; // Correct operation types from activity pages
        
        // 1. Fetch general operations (10 pages)
        console.log('📄 Fetching general operations...');
        const generalPromises = Array.from({ length: generalPages }, async (_, i) => {
          try {
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page: i + 1,
              operationType: 'all',
              operationStatus: 'all',
              resourceType: 'all'
            }));
            
            if (i === 0 || i === 4 || i === 9) {
              console.log(`📄 General page ${i + 1} completed`);
            }
            
            return result;
          } catch (error) {
            console.error(`❌ Error fetching general page ${i + 1}:`, error);
            throw error;
          }
        });

        // 2. Fetch specific operation types (3 pages each)
        console.log('🎯 Fetching specific operation types...');
        const specificPromises = specificOperationTypes.flatMap(opType => 
          Array.from({ length: 3 }, async (_, i) => {
            try {
              const result = await dispatch(fetchOperationsByOrgId({
                id: org.id,
                page: i + 1,
                operationType: opType,
                operationStatus: 'all',
                resourceType: 'all'
              }));
              
              console.log(`🎯 ${opType} page ${i + 1} completed`);
              return result;
            } catch (error) {
              console.error(`❌ Error fetching ${opType} page ${i + 1}:`, error);
              throw error;
            }
          })
        );

        // 3. Fetch failed operations specifically (1 page)
        console.log('❌ Fetching failed operations...');
        const failedPromises = [
          dispatch(fetchOperationsByOrgId({
            id: org.id,
            page: 1,
            operationType: 'all',
            operationStatus: 'failed',
            resourceType: 'all'
          })).then((result: any) => {
            console.log('❌ Failed operations page completed');
            return result;
          }).catch((error: any) => {
            console.error('❌ Error fetching failed operations:', error);
            throw error;
          })
        ];

        // Execute all fetches in parallel
        await Promise.allSettled([
          ...generalPromises,
          ...specificPromises,
          ...failedPromises
        ]);
        
        console.log(`📡 All API calls sent (${generalPages + specificOperationTypes.length * 3 + 1} total), waiting for Redux store...`);
      } catch (error) {
        console.error('❌ Error in fetch process:', error);
        // Even on error, let the useEffect above handle the timeout
      }
    };

    fetchInitialOperations();

    // Optional: Set up less aggressive polling (every 2 minutes instead of 1)
    // For polling, just fetch first 2 pages to get newest operations
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Polling for new operations...');
        Promise.all([
          dispatch(fetchOperationsByOrgId({
            id: org.id,
            page: 1,
            operationType: 'all',
            operationStatus: 'all',
            resourceType: 'all'
          })),
          dispatch(fetchOperationsByOrgId({
            id: org.id,
            page: 2,
            operationType: 'all',
            operationStatus: 'all',
            resourceType: 'all'
          }))
        ]).catch(error => {
          console.error('❌ Error polling operations:', error);
        });
      }
    }, 120000); // 2 minutes

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch, org?.id]);

  // Memoized helper functions
  const getStatusStyle = useMemo(() => (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DONE':
      case 'SUCCEEDED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatStatus = useMemo(() => (status: string) => {
    if (!status) return '';
    return status.toUpperCase() === 'SUCCEEDED' ? 'DONE' : status.toUpperCase();
  }, []);

  const formatDate = useMemo(() => (dateString: string) => {
    if (!dateString) return '—';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '—';
    }
  }, []);

  const getActivityLink = useMemo(() => (type: string) => {
    switch (type) {
      case 'deploy':
        return '/activity?resource_type=all&operation_type=deploy&operation_status=all';
      case 'apps:scale':
        return '/activity?resource_type=all&operation_type=scale&operation_status=all';
      case 'db:restart':
        return '/activity?resource_type=Database&operation_type=restart&operation_status=all';
      case 'Failed Op':
        return '/activity?resource_type=all&operation_type=all&operation_status=failed';
      default:
        return '/activity';
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Recent Activity</h2>
        <Link 
          to="/activity"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] border-b border-gray-200">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px] border-b border-gray-200">
                  Resource Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px] border-b border-gray-200">
                  User
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] border-b border-gray-200">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] border-b border-gray-200">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(['deploy', 'apps:scale', 'db:restart', 'Failed Op'] as const).map((activityType) => {
                const operationData = !isLoading && memoizedActivities ? memoizedActivities[activityType] : null;
                
                return (
                  <tr key={activityType} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <Link
                          to={getActivityLink(activityType)}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            activityType === 'deploy'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : activityType === 'apps:scale'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : activityType === 'db:restart'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-red-100 text-gray-900 hover:bg-red-200'
                          }`}
                        >
                          {activityType}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isLoading ? (
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                      ) : operationData ? (
                        <div className="flex flex-col">
                          <Link
                            to={`/${operationData.resourceType === 'vhost' ? 'vhosts' : `${operationData.resourceType.toLowerCase()}s`}/${operationData.resourceId}`}
                            className="text-sm text-gray-900 hover:text-blue-600"
                          >
                            {operationData.resourceName}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {operationData.resourceType.charAt(0).toUpperCase() + operationData.resourceType.slice(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No recent activity found</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {isLoading ? (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                      ) : operationData ? (
                        <span className="break-all block w-full">{operationData.user}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isLoading ? (
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : operationData ? (
                        <Link
                          to={`/operations/${operationData.id}`}
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${getStatusStyle(operationData.status)}`}
                        >
                          {formatStatus(operationData.status)}
                        </Link>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {isLoading ? (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                      ) : operationData ? (
                        formatDate(operationData.date)
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 