import { useState, useEffect } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectSourcesAsList } from "@app/source";
import { sourceDetailUrl } from "@app/routes";
import { selectSourcesForTableSearch } from "@app/deploy";
import type { WebState } from "@app/schema";

export const Sources = () => {
  const dispatch = useDispatch();
  const sources = useSelector(selectSourcesAsList);
  const sourcesWithLiveCommits = useSelector((state: WebState) => 
    selectSourcesForTableSearch(state, { search: '', sortBy: 'liveCommits', sortDir: 'desc' })
  );

  // Loading states
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

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Sources</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-600">Top Connected Repositories</h3>
          </div>
          <Link 
            to="http://localhost:4200/sources" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All →
          </Link>
        </div>
        <div className="px-4 pb-4">
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
  );
}; 