import { ArrowsPointingInIcon, CurrencyDollarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectDatabasesForTableSearch,
  formatCurrency,
} from "@app/deploy";
import { schema } from "@app/schema";
import { Tooltip } from "../../shared";
import type { WebState } from "@app/schema";

export const Scaling = () => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const services = useSelector(schema.services.selectTableAsList);
  const databases = useSelector((state: WebState) => 
    selectDatabasesForTableSearch(state, { 
      search: '', 
      sortBy: 'savings', 
      sortDir: 'desc' 
    })
  );
  const recommendations = useSelector(schema.manualScaleRecommendations.selectTableAsList);
  const serviceSizingPolicies = useSelector(schema.serviceSizingPolicies.selectTable);

  // Track when data has loaded
  useEffect(() => {
    if (services && databases && recommendations && !hasInitiallyLoaded) {
      // Add a small delay to ensure smooth loading experience
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [services, databases, recommendations, hasInitiallyLoaded]);

  // Loading states - show loading if data hasn't loaded yet OR if we haven't marked as initially loaded
  const isServicesLoading = !services || !hasInitiallyLoaded;
  const isDatabasesLoading = !databases || !hasInitiallyLoaded;
  const isRecommendationsLoading = !recommendations || !hasInitiallyLoaded;

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

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Scaling</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow">
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
  );
}; 