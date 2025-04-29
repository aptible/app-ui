import { CurrencyDollarIcon, RocketLaunchIcon, InformationCircleIcon, GlobeAltIcon, CubeIcon, CircleStackIcon, Square3Stack3DIcon, BookOpenIcon, QuestionMarkCircleIcon, ClockIcon, CommandLineIcon, ArrowsPointingInIcon, XMarkIcon, SparklesIcon, CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import {
  selectApps,
  selectDatabases,
  selectEndpoints,
  selectEnvironmentsByOrg,
  selectServices,
  selectStacksByOrgAsList,
  selectAutoscalingEnabledById,
  formatCurrency,
  getStackType,
  computeCostId,
  selectServicesForTableSearch,
  selectDatabasesForTableSearch,
  selectEndpointsForTableSearch,
  selectSourcesForTableSearch,
  pollOrgOperations,
  cancelOrgOperationsPoll,
  fetchOperationsByAppId,
  fetchOperationsByServiceId,
  fetchOperationsByOrgId,
} from "@app/deploy";
import { selectSourcesAsList } from "@app/source";
import { sourceDetailUrl } from "@app/routes";
import { schema } from "@app/schema";
import { selectOrganizationSelected } from "@app/organizations";
import { DetailTitleBar, DetailInfoGrid, Tooltip, IconEndpoint, IconService } from "../shared";
import { AppSidebarLayout } from "../layouts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { prettyDateTime } from "@app/date";
import { fetchDeploymentsByAppId, selectDeploymentsByAppId } from "@app/deployment";
import { selectLatestDeployOp } from "@app/deploy/operation";
import { useDispatch } from "react-redux";
import type { Deployment, DeployOperation, OperationStatus } from "@app/types";
import type { WebState } from "@app/schema";
import { useQuery } from "@app/react";
import { createSelector } from "@app/fx";
import { fetchDeployments } from "@app/deployment";
import { 
  selectOperationsByServiceId,
  fetchOperationById,
} from "@app/deploy/operation";
import {
  Banner,
  ButtonLinkDocs,
  Group,
  IconChevronRight,
  IconX,
  tokens,
} from "../shared";
import { formatDistanceToNow } from "date-fns";

interface ResourceOverviewBoxProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  href?: string;
  tooltip?: string;
}

const ResourceOverviewBox: React.FC<ResourceOverviewBoxProps> = ({ icon, title, value, href, tooltip }) => {
  const Content = (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-2.5 h-full flex flex-col min-h-[90px]">
      <div className="flex items-center justify-center gap-1 text-gray-500">
        <span className="w-4 h-4 text-gray-500 flex-shrink-0">{icon}</span>
        <div className="flex items-center gap-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-600 leading-normal line-clamp-2">{title}</h3>
          {tooltip && (
            <Tooltip text={tooltip}>
              <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-3xl font-semibold ${href ? 'text-blue-600' : ''}`}>{value.toString()}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block h-full hover:text-blue-800">
        {Content}
      </a>
    );
  }

  return Content;
};

const QuickLinkCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <a href={href} className="block group h-full">
    <div className="p-4 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300 h-full">
      <div className="flex items-center mb-2">
        <span className="mr-2 text-gray-500">{icon}</span>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">{title}</div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </a>
);

const ResourceCard = ({ icon, title, href }: { icon: React.ReactNode, title: string, href: string }) => (
  <a href={href} className="block h-full" target="_blank" rel="noopener noreferrer">
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 h-full">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 text-gray-500">{icon}</span>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
    </div>
  </a>
);

interface SecurityBoxProps {
  title: string;
  description: React.ReactNode;
  tooltip?: string;
  isLoading?: boolean;
  hasDedicatedStack?: boolean;
  children?: React.ReactNode;
}

const SecurityBox = ({ title, description, tooltip, isLoading = false, hasDedicatedStack = false, children }: SecurityBoxProps) => {
  const isInProgress = title === "HIPAA Addressable Controls" || title === "HITRUST Controls";
  const isHipaaRequired = title === "HIPAA Required Controls";

  const getBackgroundColor = () => {
    if (isLoading) return 'bg-gray-50 border-gray-200';
    if (isInProgress) return 'bg-gray-50 border-gray-200';
    if (isHipaaRequired) {
      return hasDedicatedStack ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200';
    }
    return 'bg-emerald-50 border-emerald-200';
  };

  const getIconColor = () => {
    if (isLoading) return 'text-gray-400';
    if (isInProgress) return 'text-gray-600';
    if (isHipaaRequired) {
      return hasDedicatedStack ? 'text-emerald-600' : 'text-orange-600';
    }
    return 'text-emerald-600';
  };

  return (
    <div className={`p-4 rounded-lg border shadow flex flex-col justify-between h-full ${getBackgroundColor()}`}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
          ) : isInProgress ? (
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <CheckCircleIcon className={`w-5 h-5 ${getIconColor()}`} />
          )}
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {tooltip && (
            <Tooltip text={tooltip}>
              <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
            </Tooltip>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading compliance data...</span>
          </div>
        </div>
      ) : children}
    </div>
  );
};

interface DeploymentWithApp extends Deployment {
  appHandle: string;
  user: string;
}

const selectRecentDeployments = createSelector(
  [
    schema.apps.selectTableAsList,
    schema.deployments.selectTableAsList,
    schema.operations.selectTableAsList,
    (state: WebState) => state,
  ],
  (apps, deployments, operations, state) => {
    // Return null if data hasn't loaded yet
    if (!apps || !deployments || !operations) {
      return null;
    }

    // Sort deployments by date, most recent first
    return deployments
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(deployment => {
        const app = apps.find(app => app.id === deployment.appId);
        const operation = operations.find(op => op.id === deployment.operationId);
        
        // Skip if we don't have complete data
        if (!app || !operation) {
          return null;
        }

        return {
          ...deployment,
          appHandle: app.handle,
          status: operation.status,
          user: operation.userName || 'unknown'
        };
      })
      .filter((d): d is (DeploymentWithApp & { status: string }) => d !== null);
  }
);

const AppDeploymentSection = () => {
  const recentDeployments = useSelector(selectRecentDeployments);
  const showLoading = recentDeployments === null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <RocketLaunchIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-medium">Recent App Deployments</h2>
        </div>
        <Link 
          to="/activity?resource_type=App&operation_type=deploy&operation_status=all" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      <div className="px-6 py-4">
        {showLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-gray-500">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading deployments...</span>
            </div>
          </div>
        ) : recentDeployments && recentDeployments.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/apps/${recentDeployments[0].appId}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                {recentDeployments[0].appHandle}
              </Link>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                {recentDeployments[0].status === 'succeeded' ? 'Done' : 'Failed'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{recentDeployments[0].user}</span>
              <span className="text-sm text-gray-500">
                {prettyDateTime(recentDeployments[0].updatedAt)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-gray-500">No recent deployments</span>
          </div>
        )}
      </div>
    </div>
  );
};

const selectRecentScalingActivity = createSelector(
  [
    schema.operations.selectTableAsList,
    schema.services.selectTableAsList,
    (state: WebState) => state,
  ],
  (operations, services, state) => {
    if (!operations || !services) return null;
    
    const scaleOps = operations
      .filter(op => op.type === 'scale')
      .map(operation => ({
        ...operation,
        resourceName: services.find(service => service.id === operation.resourceId)?.handle || operation.resourceId,
        resourceType: 'service',
        status: operation.status,
        user: operation.userName || 'Unknown User'
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return scaleOps.length > 0 ? scaleOps : null;
  }
);

const RecentScalingActivitySection = () => {
  const recentScaling = useSelector(selectRecentScalingActivity);
  const showLoading = recentScaling === null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <ArrowsPointingInIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-medium">Recent Scaling Activity</h2>
        </div>
        <Link 
          to="/activity?resource_type=all&operation_type=scale&operation_status=all" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      <div className="px-6 py-4">
        {showLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-gray-500">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading scaling activity...</span>
            </div>
          </div>
        ) : recentScaling && recentScaling.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/services/${recentScaling[0].resourceId}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                {recentScaling[0].resourceName}
              </Link>
              <span className="text-xs text-gray-500">Service</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {recentScaling[0].status.charAt(0).toUpperCase() + recentScaling[0].status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{recentScaling[0].user}</span>
              <span className="text-sm text-gray-500">
                {prettyDateTime(recentScaling[0].updatedAt)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-gray-500">No recent scaling activity</span>
          </div>
        )}
      </div>
    </div>
  );
};

const selectRecentDeployActivity = createSelector(
  [
    schema.operations.selectTableAsList,
    schema.apps.selectTableAsList,
    (state: WebState) => state,
  ],
  (operations, apps, state) => {
    if (!operations || !apps) return null;
    
    const deployOps = operations
      .filter(op => op.type === 'deploy')
      .map(operation => ({
        ...operation,
        resourceName: apps.find(app => app.id === operation.resourceId)?.handle || operation.resourceId,
        resourceType: 'app'
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return deployOps.length > 0 ? deployOps : null;
  }
);

const selectRecentRestartActivity = createSelector(
  [
    schema.operations.selectTableAsList,
    schema.databases.selectTableAsList,
    (state: WebState) => state,
  ],
  (operations, databases, state) => {
    if (!operations || !databases) return null;
    
    const restartOps = operations
      .filter(op => op.type === 'restart')
      .map(operation => ({
        ...operation,
        resourceName: databases.find(db => db.id === operation.resourceId)?.handle || operation.resourceId,
        resourceType: 'database'
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return restartOps.length > 0 ? restartOps : null;
  }
);

const selectRecentFailedActivity = createSelector(
  [
    schema.operations.selectTableAsList,
    schema.apps.selectTableAsList,
    schema.services.selectTableAsList,
    schema.databases.selectTableAsList,
    (state: WebState) => state,
  ],
  (operations, apps, services, databases, state) => {
    if (!operations || !apps || !services || !databases) return null;
    
    const failedOps = operations
      .filter(op => op.status === 'failed')
      .map(operation => {
        let resourceName = operation.resourceId;
        let resourceType = operation.resourceType;

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

        return {
          ...operation,
          resourceName,
          resourceType
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return failedOps.length > 0 ? failedOps : null;
  }
);

interface OperationType {
  type: string;
  resourceType: string;
  status: string;
}

const operationTypes: OperationType[] = [
  { type: 'deploy', resourceType: 'all', status: 'all' },
  { type: 'scale', resourceType: 'all', status: 'all' },
  { type: 'restart', resourceType: 'all', status: 'all' },
  { type: 'all', resourceType: 'all', status: 'failed' }
];

const RecentActivitySection = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const org = useSelector(selectOrganizationSelected);
  
  // Get lists of resources and operations
  const operations = useSelector(schema.operations.selectTableAsList);
  const apps = useSelector(selectApps);
  const services = useSelector(selectServices);
  const databases = useSelector(selectDatabases);

  // Use separate selectors for each activity type
  const deployActivity = useSelector(selectRecentDeployActivity);
  const scalingActivity = useSelector(selectRecentScalingActivity);
  const restartActivity = useSelector(selectRecentRestartActivity);
  const failedActivity = useSelector(selectRecentFailedActivity);

  // Update isDataReady when we have all required data
  useEffect(() => {
    setIsDataReady(Boolean(operations && apps && services && databases));
  }, [operations, apps, services, databases]);

  // Check if we have actual operation data
  const hasOperationData = deployActivity !== null || scalingActivity !== null || 
                          restartActivity !== null || failedActivity !== null;

  useEffect(() => {
    if (!org?.id) return;

    let isMounted = true;

    const fetchOperations = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      console.log('🚀 Starting operations fetch:', new Date().toISOString());

      try {
        // First, fetch last 5 pages of all operations and wait for them to complete
        console.log('📚 Starting initial 5-page fetch');
        const startTime = Date.now();
        
        const initialFetches = await Promise.all(
          Array.from({ length: 5 }, (_, i) => i + 1).map(async page => {
            const pageStartTime = Date.now();
            console.log(`📄 Fetching page ${page} of all operations...`);
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page,
              operationType: 'all',
              operationStatus: 'all',
              resourceType: 'all'
            }));
            console.log(`✅ Page ${page} fetch completed in ${Date.now() - pageStartTime}ms`);
            return result;
          })
        );

        console.log(`📊 All initial pages fetched in ${Date.now() - startTime}ms`);

        // Then, fetch specific operation types with their filters
        console.log('🎯 Starting specific operation type fetches');
        const specificStartTime = Date.now();
        
        const specificFetches = await Promise.all([
          // Deploy operations
          (async () => {
            const deployStartTime = Date.now();
            console.log('🚀 Fetching deploy operations...');
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page: 1,
              operationType: 'deploy',
              operationStatus: 'all',
              resourceType: 'all'
            }));
            console.log(`✅ Deploy operations fetched in ${Date.now() - deployStartTime}ms`);
            return result;
          })(),
          // Scale operations
          (async () => {
            const scaleStartTime = Date.now();
            console.log('⚖️ Fetching scale operations...');
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page: 1,
              operationType: 'scale',
              operationStatus: 'all',
              resourceType: 'all'
            }));
            console.log(`✅ Scale operations fetched in ${Date.now() - scaleStartTime}ms`);
            return result;
          })(),
          // Restart operations
          (async () => {
            const restartStartTime = Date.now();
            console.log('🔄 Fetching restart operations...');
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page: 1,
              operationType: 'restart',
              operationStatus: 'all',
              resourceType: 'all'
            }));
            console.log(`✅ Restart operations fetched in ${Date.now() - restartStartTime}ms`);
            return result;
          })(),
          // Failed operations
          (async () => {
            const failedStartTime = Date.now();
            console.log('❌ Fetching failed operations...');
            const result = await dispatch(fetchOperationsByOrgId({
              id: org.id,
              page: 1,
              operationType: 'all',
              operationStatus: 'failed',
              resourceType: 'all'
            }));
            console.log(`✅ Failed operations fetched in ${Date.now() - failedStartTime}ms`);
            return result;
          })()
        ]);

        console.log(`📊 All specific operation fetches completed in ${Date.now() - specificStartTime}ms`);

        // Only set loading to false if we have all the data AND actual operation data
        if (isMounted && isDataReady && hasOperationData) {
          setIsLoading(false);
          console.log(`🏁 Total fetch operation completed in ${Date.now() - startTime}ms`);
        }
      } catch (error) {
        console.error('❌ Error fetching operations:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchOperations();

    // Set up polling interval - only fetch first page for new operations
    const pollOperations = async () => {
      if (!isMounted) return;
      
      try {
        console.log('🔄 Starting poll operations:', new Date().toISOString());
        const pollStartTime = Date.now();
        
        await Promise.all(operationTypes.map(async ({ type, resourceType, status }) => {
          const typeStartTime = Date.now();
          console.log(`📡 Polling ${type} operations...`);
          
          await dispatch(fetchOperationsByOrgId({
            id: org.id,
            page: 1,
            operationType: type,
            operationStatus: status,
            resourceType: resourceType
          }));
          
          console.log(`✅ ${type} poll completed in ${Date.now() - typeStartTime}ms`);
        }));
        
        console.log(`🏁 Poll operations completed in ${Date.now() - pollStartTime}ms`);
      } catch (error) {
        console.error('❌ Error polling operations:', error);
      }
    };

    const interval = setInterval(pollOperations, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch, org?.id, isDataReady, hasOperationData]);

  // Helper function to get activity data
  const getOperationData = (type: string) => {
    if (isLoading || !isDataReady) return null;

    let operation;
    switch (type) {
      case 'deploy':
        operation = deployActivity?.[0];
        break;
      case 'apps:scale':
        operation = scalingActivity?.[0];
        break;
      case 'db:restart':
        operation = restartActivity?.[0];
        break;
      case 'Failed Op':
        operation = failedActivity?.[0];
        break;
      default:
        return null;
    }

    if (!operation) return null;

    return {
      resourceName: operation.resourceName,
      resourceId: operation.resourceId,
      resourceType: operation.resourceType,
      status: operation.status,
      date: operation.updatedAt,
      user: operation.userName || 'unknown',
      id: operation.id
    };
  };

  // Helper function to get status badge styling
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DONE':
      case 'SUCCEEDED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.toUpperCase() === 'SUCCEEDED' ? 'DONE' : status.toUpperCase();
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '—';
    }
  };

  // Helper function to get activity link
  const getActivityLink = (type: string) => {
    switch (type) {
      case 'deploy':
        return '/activity?resource_type=all&operation_type=deploy&operation_status=all';
      case 'apps:scale':
        return '/activity?resource_type=all&operation_type=scale&operation_status=all';
      case 'db:restart':
        return '/activity?resource_type=all&operation_type=restart&operation_status=all';
      case 'Failed Op':
        return '/activity?resource_type=all&operation_type=all&operation_status=failed';
      default:
        return '/activity';
    }
  };

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
              {['deploy', 'apps:scale', 'db:restart', 'Failed Op'].map((activity) => {
                const operationData = getOperationData(activity);
                return (
                  <tr key={activity} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <Link
                          to={getActivityLink(activity)}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            activity === 'deploy'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : activity === 'apps:scale'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : activity === 'db:restart'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-red-100 text-gray-900 hover:bg-red-200'
                          }`}
                        >
                          {activity}
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
                      {operationData ? (
                        <span className="break-all block w-full">{operationData.user}</span>
                      ) : isLoading ? (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {operationData ? (
                        <Link
                          to={`/operations/${operationData.id}`}
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${getStatusStyle(operationData.status)}`}
                        >
                          {formatStatus(operationData.status)}
                        </Link>
                      ) : isLoading ? (
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {operationData ? (
                        formatDate(operationData.date)
                      ) : isLoading ? (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
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

export const HomePage = () => {
  const [showWhatsNew, setShowWhatsNew] = useState(true);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(true);

  // Add state for delayed data display
  const [isDataStable, setIsDataStable] = useState(false);
  
  const dispatch = useDispatch();
  const apps = useSelector(schema.apps.selectTableAsList);
  const services = useSelector(schema.services.selectTableAsList);
  const deployments = useSelector(schema.deployments.selectTableAsList);
  const operations = useSelector(schema.operations.selectTableAsList);
  const stacks = useSelector((state: WebState) => selectStacksByOrgAsList(state));
  const endpoints = useSelector((state: WebState) => 
    selectEndpointsForTableSearch(state, { search: '' })
  );
  const databases = useSelector((state: WebState) => 
    selectDatabasesForTableSearch(state, { 
      search: '', 
      sortBy: 'savings', 
      sortDir: 'desc' 
    })
  );
  const environments = useSelector(selectEnvironmentsByOrg);
  const sources = useSelector(selectSourcesAsList);
  const sourcesWithLiveCommits = useSelector((state: WebState) => 
    selectSourcesForTableSearch(state, { search: '', sortBy: 'liveCommits', sortDir: 'desc' })
  );
  const costs = useSelector(schema.costs.selectTable);
  const recommendations = useSelector(schema.manualScaleRecommendations.selectTableAsList);
  const serviceSizingPolicies = useSelector(schema.serviceSizingPolicies.selectTable);
  
  // Loading states
  const isStacksLoading = !stacks || stacks.length === 0;
  const isServicesLoading = !services || services.length === 0;
  const isAppsLoading = !apps || apps.length === 0;
  const isDatabasesLoading = !databases || databases.length === 0;
  const isEnvironmentsLoading = !environments || Object.keys(environments).length === 0;
  const isCostsLoading = !costs || Object.keys(costs).length === 0;
  const isRecommendationsLoading = !recommendations || recommendations.length === 0;

  // Add loading state checks for Redux data
  const isSourcesInitialLoad = sources === null || sourcesWithLiveCommits === null;
  const [isForceLoading, setIsForceLoading] = useState(true);
  
  // Add forced loading delay on initial mount
  useEffect(() => {
    // Only start the timer once we have the data
    if (!isSourcesInitialLoad) {
      const timer = setTimeout(() => {
        setIsForceLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSourcesInitialLoad]);
  
  // Combine loading states
  const isSourcesLoading = isSourcesInitialLoad || isForceLoading;

  // Only compute sourceWithMostLiveCommits when data is ready and force loading is done
  const sourceWithMostLiveCommits = (!isSourcesInitialLoad && !isForceLoading) ? sourcesWithLiveCommits?.[0] : null;

  // Empty state check should only happen after all loading is complete
  const isSourcesEmpty = !isSourcesInitialLoad && !isForceLoading && (!sources?.length || !sourcesWithLiveCommits?.length);

  // Add useEffect to trigger sources data load
  useEffect(() => {
    dispatch({ type: 'FETCH_SOURCES_REQUEST' });
  }, [dispatch]);

  // Debug loading states
  console.log('Loading States:', {
    stacks: isStacksLoading,
    services: isServicesLoading,
    apps: isAppsLoading,
    databases: isDatabasesLoading,
    environments: isEnvironmentsLoading,
    costs: isCostsLoading,
    recommendations: isRecommendationsLoading,
    sources: isSourcesLoading,
    sourcesInitialLoad: isSourcesInitialLoad,
    sourcesEmpty: isSourcesEmpty,
    isDataStable
  });

  // Debug data
  console.log('Sources Data:', {
    sources,
    sourcesWithLiveCommits,
    sourceWithMostLiveCommits
  });

  // Add useEffect to trigger initial data load
  useEffect(() => {
    // Dispatch actions to load data
    dispatch({ type: 'FETCH_STACKS_REQUEST' });
    dispatch({ type: 'FETCH_SERVICES_REQUEST' });
    dispatch({ type: 'FETCH_APPS_REQUEST' });
    dispatch({ type: 'FETCH_DATABASES_REQUEST' });
    dispatch({ type: 'FETCH_ENVIRONMENTS_REQUEST' });
    dispatch({ type: 'FETCH_COSTS_REQUEST' });
    dispatch({ type: 'FETCH_RECOMMENDATIONS_REQUEST' });
  }, [dispatch]);

  // Check if user has any dedicated stacks - simplified check
  const hasDedicatedStack = !isStacksLoading && stacks ? Object.values(stacks).some(stack => getStackType(stack) === 'dedicated') : false;

  // Calculate total cost first
  const totalMonthlyCost = !isCostsLoading && costs && stacks ? stacks.reduce((total, stack) => {
    const costItem = schema.costs.findById(costs, {
      id: computeCostId("Stack", stack.id),
    });
    return total + (costItem?.estCost || 0);
  }, 0) : null;

  // Count autoscaled services
  const autoscaledServices = !isServicesLoading ? services.filter(service => {
    const policyId = service.serviceSizingPolicyId;
    if (!policyId) return false;
    const policy = serviceSizingPolicies[policyId];
    return policy?.scalingEnabled || false;
  }).length : 0;

  // Calculate savings by summing only Scale Down recommendations with savings > 150
  const servicesScaleDownSavings = !isServicesLoading && !isRecommendationsLoading ? services.reduce((total, service) => {
    // Skip if service doesn't have an app ID (exclude database services)
    if (!service.appId) return total;

    // Skip if service is autoscaled
    const policy = serviceSizingPolicies[service.serviceSizingPolicyId];
    if (policy?.scalingEnabled) return total;

    // Find the recommendation for this service
    const rec = recommendations.find(r => r.serviceId === service.id);
    if (!rec) return total;

    // Check if service configuration has changed since recommendation
    const hasProfileChanged = service.instanceClass !== rec.instanceClassAtTime;
    const hasSizeChanged = service.containerMemoryLimitMb !== rec.containerMemoryLimitMbAtTime;
    const hasChangedSinceRec = hasProfileChanged || hasSizeChanged;

    // Check if recommendation is within last 2 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 2);
    const recDate = new Date(rec.createdAt);
    const isRecent = recDate > daysAgo;

    // Only include recommendations that:
    // 1. Have savings > 150 (threshold for showing Scale Down)
    // 2. Service hasn't changed since recommendation was made
    // 3. Recommendation is from the last 2 days
    // 4. Service is not autoscaled
    // 5. Service belongs to an app (not a database)
    if (rec.costSavings > 150 && !hasChangedSinceRec && isRecent) {
      // Round to 2 decimal places to match UI display
      return total + Math.round(rec.costSavings * 100) / 100;
    }
    return total;
  }, 0) : 0;

  // Only count database savings where there's a visible Scale Down recommendation
  const databaseScaleDownSavings = !isDatabasesLoading ? databases.reduce((total, db) => {
    // A recommendation is only shown in the UI if:
    // 1. The savings are > 150 (threshold for showing Scale Down)
    // 2. The savings are positive
    if (db.savings > 150) {
      return total + db.savings;
    }
    return total;
  }, 0) : 0;

  const handleDismiss = () => {
    setShowFeedbackBanner(false);
    // Keeping localStorage code commented out for future use
    // localStorage.setItem('feedbackBannerDismissed', 'true');
  };

  return (
    <div className="relative">
      <AppSidebarLayout>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Home</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://app.aptible.com/sso/cli"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CommandLineIcon className="w-5 h-5" />
                SSO CLI Token
              </a>
              <a
                href="https://www.aptible.com/docs/reference/aptible-cli/overview"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CommandLineIcon className="w-5 h-5" />
                Install the CLI
              </a>
            </div>
          </div>
          <div className="p-6 space-y-8">
            {/* Temporarily hidden What's New section
            {showWhatsNew && (
              <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-medium text-gray-900">What's New</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://www.aptible.com/changelog"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View All Updates →
                    </a>
                    <button
                      onClick={() => setShowWhatsNew(false)}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Dismiss"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">March Enhancements - Operation Logs, Terraform, CLI, and more</h3>
                  <p className="mt-1 text-sm text-gray-600">Better differentiate the output of container logs from platform logs in operations, improvements to Terraform provider, CLI updates, and UI enhancements.</p>
                </div>
              </div>
            )}
            */}

            <div>
              <h2 className="text-lg font-medium mb-4">Overview</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 shadow">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-gray-200">
                  <div className="p-4 flex flex-col items-center border-b border-gray-200 sm:border-b lg:border-b-0">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <Square3Stack3DIcon className="w-4 h-4" />
                      <h3 className="text-sm font-medium text-gray-600">Dedicated Stacks</h3>
                      <Tooltip text="Total number of dedicated stacks">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                    {isStacksLoading ? (
                      <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Link to="http://localhost:4200/stacks" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                        {Object.values(stacks).filter(stack => getStackType(stack) === 'dedicated').length}
                      </Link>
                    )}
                  </div>

                  <div className="p-4 flex flex-col items-center border-b border-gray-200 sm:border-b lg:border-b-0">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <GlobeAltIcon className="w-4 h-4" />
                      <h3 className="text-sm font-medium text-gray-600">Environments</h3>
                      <Tooltip text="Total number of environments in your organization">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                    {isEnvironmentsLoading ? (
                      <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Link to="http://localhost:4200/environments" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                        {Object.keys(environments).length}
                      </Link>
                    )}
                  </div>

                  <div className="p-4 flex flex-col items-center border-b border-gray-200 sm:border-b lg:border-b-0">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <CubeIcon className="w-4 h-4" />
                      <h3 className="text-sm font-medium text-gray-600">Apps</h3>
                      <Tooltip text="Total number of apps across all environments">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                    {isAppsLoading ? (
                      <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Link to="http://localhost:4200/apps" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                        {Object.keys(apps).length}
                      </Link>
                    )}
                  </div>

                  <div className="p-4 flex flex-col items-center border-b border-gray-200 lg:border-b-0">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <CircleStackIcon className="w-4 h-4" />
                      <h3 className="text-sm font-medium text-gray-600">Managed Databases</h3>
                      <Tooltip text="Total number of managed databases across all environments">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                    {isDatabasesLoading ? (
                      <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <Link to="http://localhost:4200/databases" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                        {Object.keys(databases).length}
                      </Link>
                    )}
                  </div>

                  <div className="p-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <h3 className="text-sm font-medium text-gray-600">Est. Monthly Cost</h3>
                      <Tooltip text="Estimated monthly cost based on current resource usage across all environments">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                    {isCostsLoading || !totalMonthlyCost ? (
                      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <div className="text-2xl sm:text-3xl font-semibold">
                        {formatCurrency(totalMonthlyCost)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <RecentActivitySection />
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Scaling</h2>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 shadow">
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                      <div className="p-4 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                          <ArrowsPointingInIcon className="w-4 h-4" />
                          <h3 className="text-sm font-medium text-gray-600">Autoscaled App Services</h3>
                          <Tooltip text="Number of app services with autoscaling enabled across all environments">
                            <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                          </Tooltip>
                        </div>
                        {isServicesLoading ? (
                          <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          <Link to="http://localhost:4200/services" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                            {autoscaledServices}
                          </Link>
                        )}
                      </div>

                      <div className="p-4 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <h3 className="text-sm font-medium text-gray-600">Potential Database Savings</h3>
                          <Tooltip text="Potential monthly savings from scaling down databases based on current recommendations">
                            <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                          </Tooltip>
                        </div>
                        {isDatabasesLoading ? (
                          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          <Link to="http://localhost:4200/databases" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                            {formatCurrency(databaseScaleDownSavings)}
                          </Link>
                        )}
                      </div>

                      <div className="p-4 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <h3 className="text-sm font-medium text-gray-600">Potential App Savings</h3>
                          <Tooltip text="Potential monthly savings from scaling down app services across all environments">
                            <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                          </Tooltip>
                        </div>
                        {isServicesLoading || isRecommendationsLoading ? (
                          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          <Link to="http://localhost:4200/services" className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800">
                            {formatCurrency(servicesScaleDownSavings)}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Sources</h2>
                  <div className="bg-white rounded-lg border border-gray-200 shadow">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                        <h2 className="text-sm font-medium">Top Connected Repositories</h2>
                      </div>
                      <Link 
                        to="http://localhost:4200/sources" 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View All →
                      </Link>
                    </div>
                    <div className="px-6 py-4">
                      {isSourcesLoading ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      ) : isSourcesEmpty ? (
                        <div className="flex items-start py-2">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm text-gray-500">No repositories found</span>
                            <Link 
                              to="/sources/setup"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              Setup a source →
                            </Link>
                          </div>
                        </div>
                      ) : sourceWithMostLiveCommits ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              to={sourceDetailUrl(sourceWithMostLiveCommits?.id || '')}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {sourceWithMostLiveCommits?.displayName}
                            </Link>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {sourceWithMostLiveCommits?.liveCommits?.length || 0} Live Commits
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {Array.isArray(sources) ? sources.length : 0} Total Repositories
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-2">
                          <span className="text-sm text-gray-500">No repositories found</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Security & Compliance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <SecurityBox
                  title="Infrastructure Security"
                  description={
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Aptible implements and manages the infrastructure security controls required to meet compliance with frameworks such as HIPAA, HITRUST, SOC 2 Type 2, and PCI DSS for Service Providers Level 2.{' '}
                        <a
                          href="https://trust.aptible.com/"
                          className="text-blue-600 hover:text-blue-800 font-bold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Trust Center →
                        </a>
                      </p>
                    </div>
                  }
                />
                <SecurityBox
                  title="HIPAA Required Controls"
                  description="Automate and enforce 100% of the HIPAA Required infrastructure controls with a Dedicated Stack."
                  isLoading={isStacksLoading}
                  hasDedicatedStack={hasDedicatedStack}
                >
                  <div className="mt-4">
                    <a
                      href="https://dashboard.aptible.com/controls"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Controls
                    </a>
                  </div>
                </SecurityBox>
                <SecurityBox
                  title="HIPAA Addressable Controls"
                  description="Implement the HIPAA Addressable infrastructure controls within the Security & Compliance Dashboard"
                  isLoading={isStacksLoading}
                >
                  <div className="mt-4">
                    <a
                      href="https://dashboard.aptible.com/controls"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Controls
                    </a>
                  </div>
                </SecurityBox>
                <SecurityBox
                  title="HITRUST Controls"
                  description="Implement the available HITRUST Inheritable Controls within the Security & Compliance Dashboard"
                  isLoading={isStacksLoading}
                >
                  <div className="mt-4">
                    <a
                      href="https://dashboard.aptible.com/controls"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Controls
                    </a>
                  </div>
                </SecurityBox>
              </div>
            </div>

            <div>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResourceCard
                  icon={<BookOpenIcon />}
                  title="Docs"
                  href="https://www.aptible.com/docs"
                />
                <ResourceCard
                  icon={<QuestionMarkCircleIcon />}
                  title="Support"
                  href="https://www.aptible.com/support"
                />
              </div>
            </div>
          </div>
        </div>
      </AppSidebarLayout>

      {/* Beta Feedback Banner */}
      {showFeedbackBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Banner variant="info" className="shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold mb-1">Share feedback</div>
                <div className="text-sm text-gray-600">
                  This landing page is in BETA. Have feedback? Experiencing a bug? Let us know!
                </div>
                <div className="mt-2">
                  <a
                    href="https://portal.productboard.com/aptible/2-aptible-roadmap-portal/tabs/5-under-consideration/submit-idea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    Share Feedback
                    <IconChevronRight variant="sm" className="ml-1" />
                  </a>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Dismiss feedback banner"
              >
                <IconX variant="sm" />
              </button>
            </div>
          </Banner>
        </div>
      )}
    </div>
  );
};
