import { Square3Stack3DIcon, GlobeAltIcon, CubeIcon, CircleStackIcon, CurrencyDollarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectEnvironmentsByOrg,
  selectStacksByOrgAsList,
  getStackType,
  computeCostId,
  formatCurrency,
  selectDatabasesForTableSearch,
} from "@app/deploy";
import { schema } from "@app/schema";
import { Tooltip } from "../../shared";
import type { WebState } from "@app/schema";

export const Overview = () => {
  const stacks = useSelector((state: WebState) => selectStacksByOrgAsList(state));
  const apps = useSelector(schema.apps.selectTableAsList);
  const databases = useSelector((state: WebState) => 
    selectDatabasesForTableSearch(state, { 
      search: '', 
      sortBy: 'savings', 
      sortDir: 'desc' 
    })
  );
  const environments = useSelector(selectEnvironmentsByOrg);
  const costs = useSelector(schema.costs.selectTable);

  // Loading states
  const isStacksLoading = !stacks || stacks.length === 0;
  const isAppsLoading = !apps || apps.length === 0;
  const isDatabasesLoading = !databases || databases.length === 0;
  const isEnvironmentsLoading = !environments || Object.keys(environments).length === 0;
  const isCostsLoading = !costs || Object.keys(costs).length === 0;

  // Calculate total cost
  const totalMonthlyCost = !isCostsLoading && costs && stacks ? stacks.reduce((total, stack) => {
    const costItem = schema.costs.findById(costs, {
      id: computeCostId("Stack", stack.id),
    });
    return total + (costItem?.estCost || 0);
  }, 0) : null;

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Overview</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow">
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
  );
}; 