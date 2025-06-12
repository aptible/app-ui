import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { schema } from "@app/schema";
import { getPinnedResourcesSorted, unpinResource, type PinnedResource } from "../../shared/pinned-resources";
import { appDetailUrl, databaseDetailUrl } from "@app/routes";

export const PinnedResources = () => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [pinnedResources, setPinnedResources] = useState<PinnedResource[]>([]);
  const apps = useSelector(schema.apps.selectTableAsList);
  const databases = useSelector(schema.databases.selectTableAsList);
  const services = useSelector(schema.services.selectTableAsList);

  // Track when data has loaded
  useEffect(() => {
    if (apps && databases && services && !hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [apps, databases, services, hasInitiallyLoaded]);

  // Load pinned resources from localStorage
  useEffect(() => {
    const loadPinnedResources = () => {
      // No limit - show all pinned resources with scroll
      const allPinned = getPinnedResourcesSorted();
      setPinnedResources(allPinned);
    };

    // Load initial data
    loadPinnedResources();

    // Listen for changes
    const handlePinnedResourcesChanged = () => {
      loadPinnedResources();
    };

    window.addEventListener('pinnedResourcesChanged', handlePinnedResourcesChanged);
    return () => {
      window.removeEventListener('pinnedResourcesChanged', handlePinnedResourcesChanged);
    };
  }, []);

  // Loading states
  const isLoading = !apps || !databases || !services || !hasInitiallyLoaded;

  const getResourceIcon = (resource: PinnedResource) => {
    if (resource.type === 'app') {
      return (
        <img
          src="/resource-types/logo-app.png"
          className="w-[32px] h-[32px] align-middle"
          aria-label="App"
        />
      );
    } else if (resource.type === 'database') {
      // Find the database to get its type for the correct icon
      const database = databases?.find(db => db.id === resource.id);
      const dbType = database?.type || 'postgresql'; // fallback to postgresql
      return (
        <img
          src={`/database-types/logo-${dbType}.png`}
          className="w-[32px] h-[32px] align-middle"
          aria-label={`${dbType} Database`}
        />
      );
    }
    return (
      <div className="w-[32px] h-[32px] bg-gray-200 rounded flex items-center justify-center">
        📦
      </div>
    );
  };



  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium">Pinned Resources</h2>
        <StarIcon className="w-4 h-4 text-yellow-500" />
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="h-96 overflow-y-auto">
          {isLoading ? (
            <div className="grid gap-2 p-2 grid-cols-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pinnedResources.length > 0 ? (
            <div className={`grid gap-2 p-2 ${pinnedResources.length > 5 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {pinnedResources.map((resource) => (
                <div key={resource.id} className="p-3 hover:bg-gray-50 transition-colors rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>{getResourceIcon(resource)}</div>
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={resource.type === 'app' ? appDetailUrl(resource.id) : databaseDetailUrl(resource.id)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                        >
                          {resource.name}
                        </Link>
                        <div className="text-xs text-gray-500 capitalize">
                          {resource.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => unpinResource(resource.id, resource.type)}
                        className="text-yellow-500 hover:text-yellow-600"
                        title="Unpin resource"
                      >
                        <StarIconSolid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm mb-2">No pinned resources</p>
                <p className="text-xs text-gray-400">Pin your most important resources for quick access</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 